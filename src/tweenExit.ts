import {AsyncWeakMap} from '@pinyin/async-weak-map'
import {arrayFromNodeList} from '@pinyin/dom'
import {nextFrame, readPhase, writePhase} from '@pinyin/frame'
import {Maybe, notExisting} from '@pinyin/maybe'
import {getOriginOutline, intermediate, isInViewport, toCSS} from '@pinyin/outline'
import {ms, nothing} from '@pinyin/types'
import {calcTransitionCSS} from './calcTransitionCSS'
import {CubicBezierParam} from './CubicBezierParam';
import {forDuration} from './forDuration';
import {getTweenState} from './getTweenState'
import {isFunction} from './isFunction'
import {newTweenID} from './newTweenID'
import {TweenID} from './TweenID'
import {TweenState} from './TweenState'

const observer = new MutationObserver((
    mutations: MutationRecord[],
    observer: MutationObserver
): void => {
    const removes = new Set(mutations.reduce(
        (acc, curr) => acc.concat(arrayFromNodeList(curr.removedNodes)),
        [] as Array<Node>)
    )
    removes.forEach(removed => {
        removedElements.set(removed, undefined)
    })
})
const removedElements = new AsyncWeakMap<Node, void>()
observer.observe(document.body, {
    childList: true,
    subtree: true
})

export async function tweenExit(
    element: Maybe<HTMLElement>,
    to: Maybe<TweenState> | ((from: TweenState) => Maybe<TweenState>) = nothing,
    duration: ms | ((from: TweenState, to: TweenState) => ms) = 200,
    easing: CubicBezierParam = [0, 0, 1, 1]
): Promise<void> {
    if (notExisting(element)) { return }
    if (!document.body.contains(element)) { return }

    const parent = element.parentElement
    if (notExisting(parent)) { return }
    const from = getTweenState(element)
    if (!isInViewport(from)) { return }
    to = isFunction(to) ? to(from) : to
    if (notExisting(to)) { return }
    duration = isFunction(duration) ? duration(from, to) : duration
    if (duration <= 50) { return }
    const tweenID = newTweenID()
    tweeningExit.set(element, tweenID)

    await removedElements.get(element)
    await writePhase()
    if (tweeningExit.get(element) !== tweenID) { return }
    const placeholder = element.cloneNode(true) as HTMLElement
    placeholder.style.position = `absolute`
    parent.appendChild(placeholder)

    await readPhase()
    const current = getOriginOutline(placeholder)

    await writePhase()
    placeholder.style.transition = `none`
    placeholder.style.transform = toCSS(intermediate(current, from))
    placeholder.style.opacity = `${from.opacity}`

    await nextFrame()
    await writePhase()
    if (tweeningExit.get(element) !== tweenID) {
        parent.removeChild(placeholder);
        return
    }
    placeholder.style.transition = calcTransitionCSS(duration, easing)
    placeholder.style.transform = toCSS(intermediate(current, to))
    placeholder.style.opacity = `${to.opacity}`

    await forDuration(duration)
    await writePhase()
    parent.removeChild(placeholder)
}

export const tweeningExit: WeakMap<Element, TweenID> = new WeakMap()
