import {arrayFromNodeList, isElement, snapshotNode, travel} from '@pinyin/dom'
import {nextFrame, OptimizeFor, readPhase, writePhase} from '@pinyin/frame'
import {existing, Maybe, notExisting} from '@pinyin/maybe'
import {isInViewport, toCSS} from '@pinyin/outline'
import {ms, nothing} from '@pinyin/types'
import {SynchronousPromise} from 'synchronous-promise'
import {calcTransitionCSS} from './calcTransitionCSS'
import {COORDINATOR} from './Coordinator'
import {CubicBezierParam} from './CubicBezierParam'
import {forDuration} from './forDuration'
import {getOriginalTweenState} from './getOriginalTweenState'
import {getTweenState} from './getTweenState'
import {intermediateTweenState} from './intermediateTweenState'
import {isFunction} from './isFunction'
import {Tweenable} from './Tweenable'
import {TweenState} from './TweenState'
import {TweenStateDiff} from './TweenStateDiff'

export async function tweenExit(
    element: Maybe<Tweenable>,
    to: Maybe<TweenState> | ((from: TweenState) => Maybe<TweenState>) = nothing,
    params: Partial<TweenExitParams> = {},
): Promise<void> {
    if (!initialized) {
        observer.observe(document.body, {childList: true, subtree: true})
        initialized = true
    }
    if (notExisting(element) || !document.body.contains(element) || notExisting(element.parentElement)) {
        return
    }

    const fullParams: TweenExitParams = {
        duration: 200,
        container: element.parentElement,
        easing: [0, 0, 1, 1],
        fixed: false,
        ...params,
    }

    const container = fullParams.container
    const fixed = fullParams.fixed
    const easing = fullParams.easing

    if (notExisting(container) || !document.body.contains(container)) {
        return
    }

    const acquireLock = lock.get(element)
    if (existing(acquireLock)) {
        try { acquireLock() } catch {}
    }
    let cleanup = () => { }
    const releaseLock = () => {
        if (lock.get(element) === releaseLock) {
            lock.delete(element)
            cleanup()
        }
    }
    lock.set(element, releaseLock)

    // TODO can this be batched?
    const from = getTweenState(element)
    if (!isInViewport(from)) {
        return
    }
    const snapshot = snapshotNode(element) as HTMLElement
    snapshot.style.position = `absolute` // TODO more optimization such as contain

    await new SynchronousPromise(
        (resolve: () => void, reject: () => void) => {
            listeners.set(element, () => {
                listeners.delete(element)
                resolve()
            })
            cleanup = () => {
                listeners.delete(element)
                reject()
            }
        },
    )
    await writePhase(OptimizeFor.LATENCY)
    container.appendChild(snapshot)
    cleanup = () => {
        try { container.removeChild(snapshot) } catch {}
    }
    await readPhase(OptimizeFor.LATENCY)
    let origin = getOriginalTweenState(snapshot)
    const inverse: TweenStateDiff = intermediateTweenState(origin, from)
    await writePhase(OptimizeFor.LATENCY)
    snapshot.style.transition = `none`
    snapshot.style.transform = toCSS(inverse)
    snapshot.style.opacity = `${origin.opacity + inverse.opacity}`
    COORDINATOR.coordinate(snapshot, {origin: origin, diff: inverse, fixed: fixed})

    await readPhase(OptimizeFor.PERFORMANCE)
    if (lock.get(element) !== releaseLock) {
        releaseLock()
        return
    }
    to = isFunction(to) ? to(from) : to
    if (notExisting(to)) {
        releaseLock()
        return
    }
    const duration = isFunction(fullParams.duration) ? fullParams.duration(from, to) : fullParams.duration
    if (duration < 30) {
        releaseLock()
        return
    }
    origin = getOriginalTweenState(snapshot)

    await nextFrame()
    await writePhase(OptimizeFor.PERFORMANCE)
    if (lock.get(element) !== releaseLock) {
        releaseLock()
        return
    }
    const play = intermediateTweenState(origin, to)
    snapshot.style.transition = calcTransitionCSS(duration, easing)
    snapshot.style.transform = toCSS(play)
    snapshot.style.opacity = `${origin.opacity + play.opacity}`
    COORDINATOR.coordinate(snapshot, {origin: origin, diff: play, fixed: fixed})

    await forDuration(duration)
    await writePhase(OptimizeFor.PERFORMANCE)
    releaseLock()
}

const lock: WeakMap<Element, () => void> = new WeakMap()

const listeners: WeakMap<Element, () => void> = new WeakMap()

let initialized: boolean = false // TODO improve performance
const observer: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
    const removedNodes = mutations
        .filter(records => records.removedNodes.length > 0)
        .reduce(
            (acc, curr) => {
                arrayFromNodeList(curr.removedNodes)
                    .filter(node => isElement(node))
                    .forEach(node => {
                        for (const removedNode of travel(node as Element)) {
                            acc.add(removedNode)
                        }
                    })
                return acc
            },
            new Set<Element>(),
        )
    removedNodes.forEach(tweenable => {
        const callback = listeners.get(tweenable)
        if (callback) {
            callback()
        }
    })
})

export type TweenExitParams = {
    duration: ms | ((from: TweenState, to: TweenState) => ms)
    easing: CubicBezierParam
    container: Element
    fixed: boolean
}
