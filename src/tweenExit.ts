import {arrayFromNodeList, isElement, snapshotNode, travel} from '@pinyin/dom'
import {nextFrame, readPhase, writePhase} from '@pinyin/frame'
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

// FIXME don't animate invisible element
export async function tweenExit(
    element: Maybe<Tweenable>,
    to: Maybe<TweenState> | ((from: TweenState) => Maybe<TweenState>) = nothing,
    params: Partial<TweenExitParams> = {},
): Promise<void> {
    if (!initialized) {
        observer.observe(document.body, {childList: true, subtree: true})
        initialized = true
    }

    const fullParams: TweenExitParams = {
        duration: 200,
        container: document.body,
        easing: [0, 0, 1, 1],
        ...params,
    }

    const container = fullParams.container
    if (notExisting(element) || notExisting(container) || !document.body.contains(element)) {
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
    container.appendChild(snapshot)
    cleanup = () => {
        try { container.removeChild(snapshot) } catch {}
    }
    let origin = getOriginalTweenState(snapshot)
    const inverse: TweenStateDiff = intermediateTweenState(origin, from)
    snapshot.style.transition = `none`
    snapshot.style.transform = toCSS(inverse.transform)
    snapshot.style.opacity = `${origin.opacity + inverse.opacityDelta}`
    COORDINATOR.coordinate(snapshot, {origin: origin, diff: inverse})

    await readPhase()
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
    await writePhase()
    if (lock.get(element) !== releaseLock) {
        releaseLock()
        return
    }
    const easing = fullParams.easing
    const play = intermediateTweenState(origin, to)
    snapshot.style.transition = calcTransitionCSS(duration, easing)
    snapshot.style.transform = toCSS(play.transform)
    snapshot.style.opacity = `${origin.opacity + play.opacityDelta}`
    COORDINATOR.coordinate(snapshot, {origin: origin, diff: play})

    await forDuration(duration)
    await writePhase()
    releaseLock()
}

const lock: WeakMap<Element, () => void> = new WeakMap()

const listeners: WeakMap<Element, () => void> = new WeakMap()

let initialized: boolean = false // TODO find a better way to initialize
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
}
