import {nextFrame, writePhase} from '@pinyin/frame'
import {existing, Maybe, notExisting} from '@pinyin/maybe'
import {intermediate, isSimilarOutline, toCSS} from '@pinyin/outline'
import {ms, nothing} from '@pinyin/types'
import {calcTransitionCSS} from './calcTransitionCSS'
import {CubicBezierParam} from './CubicBezierParam'
import {forDuration} from './forDuration'
import {getOriginalTweenState} from './getOriginalTweenState'
import {getTweenState} from './getTweenState'
import {hasSimilarOpacity} from './hasSimilarOpacity'
import {isFunction} from './isFunction'
import {Tweenable} from './Tweenable'
import {TweenState} from './TweenState'

// TODO
// 1. inherit velocity from previous tweening
// 2. margin/border ...
// 3. support rotate
// 4. batch update
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
        ...params,
    }

    const snapshot = getTweenState(element)
    const to = getOriginalTweenState(element)
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

    element.style.transition = 'none'
    element.style.transform = toCSS(intermediate(to, from))
    element.style.opacity = `${from.opacity}`
    cleanup = () => {
        try {
            element.style.transition = `none`
            element.style.transform = `none`
            element.style.opacity = `${to.opacity}`
        } catch {}
    }

    await nextFrame()
    await writePhase()
    if (lock.get(element) !== releaseLock) {
        releaseLock()
        return
    }
    const duration = isFunction(fullParams.duration) ? fullParams.duration(from, to) : fullParams.duration
    const easing = fullParams.easing
    element.style.transition = calcTransitionCSS(duration, easing)
    element.style.transform = `none`
    element.style.opacity = `${to.opacity}`

    await forDuration(duration)
    await writePhase()
    releaseLock()
}

export const lock: WeakMap<Element, () => void> = new WeakMap()

export type TweenHereParams = {
    duration: ms | ((from: TweenState, to: TweenState) => ms)
    easing: CubicBezierParam
}
