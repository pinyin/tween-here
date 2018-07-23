import {isElement, snapshotNode, travel} from '@pinyin/dom'
import {nextFrame, OptimizeFor, readPhase, writePhase} from '@pinyin/frame'
import {existing, Maybe, notExisting} from '@pinyin/maybe'
import {intermediate, isInViewport, toCSS} from '@pinyin/outline'
import {ms, nothing} from '@pinyin/types'
import {SynchronousPromise} from 'synchronous-promise'
import {calcTransitionCSS} from './calcTransitionCSS'
import {COORDINATOR} from './Coordinator'
import {CubicBezierParam} from './CubicBezierParam'
import {forDuration} from './forDuration'
import {getOriginalTweenState} from './getOriginalTweenState'
import {getTweenState} from './getTweenState'
import {isFunction} from './isFunction'
import {Tweenable} from './Tweenable'
import {TweenState} from './TweenState'

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
        fixed: true,
        ...params,
    }

    const container = fullParams.container
    const fixed = fullParams.fixed
    const easing = fullParams.easing
    const from = getTweenState(element)

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

    if (!isInViewport(from)) {
        return
    }
    const isParentChanged = container !== element.parentElement
    const snapshot = snapshotNode(element, isParentChanged)
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
    await writePhase(OptimizeFor.LATENCY)
    if (!document.body.contains(snapshot)) {
        releaseLock()
        return
    }
    snapshot.style.transition = `none`
    const inverse = intermediate(origin, from)
    snapshot.style.transform = toCSS(inverse)
    snapshot.style.opacity = `${from.opacity}`
    COORDINATOR.coordinate({element: snapshot, origin: origin, diff: inverse, fixed: fixed})

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
    await nextFrame()
    await writePhase(OptimizeFor.PERFORMANCE)
    if (lock.get(element) !== releaseLock) {
        releaseLock()
        return
    }
    snapshot.style.transition = calcTransitionCSS(duration, easing)
    const play = intermediate(origin, to)
    snapshot.style.transform = toCSS(play)
    snapshot.style.opacity = `${to.opacity}`
    COORDINATOR.coordinate({element: snapshot, origin: origin, diff: play, fixed: fixed})

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
                Array.from(curr.removedNodes)
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
