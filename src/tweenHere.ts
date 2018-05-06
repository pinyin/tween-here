import {nextFrame, writePhase} from '@pinyin/frame'
import {Maybe, notExisting, nothing} from '@pinyin/maybe'
import {intermediate, isSimilarOutline} from '@pinyin/outline'
import {toCSS} from '@pinyin/outline/vendor/transformation-matrix/toString'
import {ms} from '@pinyin/types'
import {calcTransitionCSS} from './calcTransitionCSS'
import {CubicBezierParam} from './CubicBezierParam'
import {forDuration} from './forDuration'
import {getOriginalTweenState} from './getOriginalTweenState'
import {getTweenState} from './getTweenState'
import {isFunction} from './isFunction'
import {newTweenID} from './newTweenID'
import {TweenID} from './TweenID'
import {TweenState} from './TweenState'

// TODO
// 1. inherit velocity from previous tweening
// 2. margin/border ...
// 3. cancellable promise?
// 4. rotation
export async function tweenHere(
    element: HTMLElement,
    from: Maybe<TweenState> | ((snapshot: TweenState, to: TweenState) => Maybe<TweenState>) = nothing,
    duration: ms | ((from: TweenState, to: TweenState) => ms) = 200,
    easing: CubicBezierParam = [0, 0, 1, 1]
): Promise<void> {
    if (!document.body.contains(element)) { return }

    const snapshot = getTweenState(element)
    const to = getOriginalTweenState(element)
    from = isFunction(from) ? from(snapshot, to) : from
    if (notExisting(from)) { return }
    if (isSimilarOutline(from, to)) { return }
    if (isSimilarOutline(snapshot, from)) { return }

    const tweenID = newTweenID()
    tweeningHere.set(element, tweenID)

    element.style.transition = 'none'
    element.style.transform = toCSS(intermediate(to, from))
    element.style.opacity = `${from.opacity}`

    await nextFrame()
    await writePhase()
    if (tweeningHere.get(element) !== tweenID) { return }
    duration = isFunction(duration) ? duration(from, to) : duration
    if (duration <= 50) { return }
    element.style.transition = calcTransitionCSS(duration, easing)
    element.style.transform = `none`
    element.style.opacity = `${to.opacity}`

    await forDuration(duration)
    await writePhase()
    if (tweeningHere.get(element) !== tweenID) { return }
    element.style.transition = `none`
}

export const tweeningHere: WeakMap<Element, TweenID> = new WeakMap()
