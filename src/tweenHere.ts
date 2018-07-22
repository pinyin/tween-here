import {nextFrame, OptimizeFor, readPhase, writePhase} from '@pinyin/frame'
import {existing, Maybe, notExisting} from '@pinyin/maybe'
import {intermediate, isSimilarOutline, toCSS} from '@pinyin/outline'
import {ms, nothing} from '@pinyin/types'
import {calcTransitionCSS} from './calcTransitionCSS'
import {COORDINATOR} from './Coordinator'
import {CubicBezierParam} from './CubicBezierParam'
import {forDuration} from './forDuration'
import {getOriginalTweenState} from './getOriginalTweenState'
import {getTweenState} from './getTweenState'
import {hasSimilarOpacity} from './hasSimilarOpacity'
import {isFunction} from './isFunction'
import {Tweenable} from './Tweenable'
import {TweenState} from './TweenState'

// TODO
// 1. inherit velocity from previous tweening (with Coordinator)
// 2. margin/border ...
// 3. support rotate
export async function tweenHere(
    element: Maybe<Tweenable>,
    from: Maybe<TweenState> | ((snapshot: TweenState, to: TweenState) => Maybe<TweenState>) = nothing,
    params: Partial<TweenHereParams> = {},
): Promise<void> {
    if (notExisting(element)) { return }
    if (!document.body.contains(element)) { return }

    const fullParams: TweenHereParams = {
        duration: 200,
        easing: [0, 0, 1, 1],
        fixed: true,
        ...params,
    }

    const fixed = fullParams.fixed
    const easing = fullParams.easing
    // @ts-ignore // FIXME
    element.style.willChange = 'transform, opacity'
    await readPhase(OptimizeFor.LATENCY)
    const to = getOriginalTweenState(element)
    const snapshot = getTweenState(element)
    from = isFunction(from) ? from(snapshot, to) : from
    if (notExisting(from)) { return }
    if (isSimilarOutline(from, to) && hasSimilarOpacity(from, to)) { return }
    if (isSimilarOutline(snapshot, from) && hasSimilarOpacity(snapshot, from)) { return }

    const acquireLock = lock.get(element)
    if (existing(acquireLock)) {
        try { acquireLock() } catch {}
    }
    let cleanup = () => {}
    const releaseLock = () => {
        if (lock.get(element) === releaseLock) {
            lock.delete(element)
            cleanup()
        }
    }
    lock.set(element, releaseLock)

    await writePhase(OptimizeFor.LATENCY)
    element.style.transition = 'none'
    const inverse = intermediate(to, from)
    element.style.transform = toCSS(inverse)
    element.style.opacity = `${from.opacity}`
    COORDINATOR.coordinate({element: element, origin: to, diff: inverse, fixed: fixed})
    cleanup = () => {
        try {
            element.style.transition = `none`
            element.style.transform = `none`
            element.style.opacity = `${to.opacity}`
        } catch {}
    }

    await nextFrame()
    await nextFrame()
    await writePhase(OptimizeFor.PERFORMANCE)
    if (lock.get(element) !== releaseLock) {
        releaseLock()
        return
    }
    const duration = isFunction(fullParams.duration) ?
        fullParams.duration(from, to) :
        fullParams.duration
    element.style.transition = calcTransitionCSS(duration, easing)
    element.style.transform = `none`
    element.style.opacity = `${to.opacity}`

    await forDuration(duration)
    await writePhase(OptimizeFor.PERFORMANCE)
    releaseLock()
}

export const lock: WeakMap<Element, () => void> = new WeakMap()

export type TweenHereParams = {
    duration: ms | ((from: TweenState, to: TweenState) => ms)
    easing: CubicBezierParam
    fixed: boolean
}
