import {AsyncWeakMap} from '@pinyin/async-weak-map'
import {arrayFromNodeList} from '@pinyin/dom'
import {nextFrame, writePhase} from '@pinyin/frame/lib'
import {existing, Maybe, notExisting, nothing} from '@pinyin/maybe'
import {getOriginOutline, intermediate} from '@pinyin/outline'
import {isInViewport} from '@pinyin/outline/dist/isInViewport'
import {toCSS} from '@pinyin/outline/vendor/transformation-matrix/toString'
import {ms} from '@pinyin/types'
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
    const removes = new Set(mutations.flatMap(it => arrayFromNodeList(it.removedNodes)))
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
    element: HTMLElement,
    to: Maybe<TweenState> | ((from: TweenState) => Maybe<TweenState>) = nothing,
    duration: ms | ((from: TweenState, to: TweenState) => ms) = 200,
    easing: CubicBezierParam = [0, 0, 1, 1]
): Promise<void> {
    if (!document.body.contains(element)) { return }

    const parent = element.parentElement
    if (notExisting(parent)) { return }
    const nextSibling = element.nextSibling
    const origin = getOriginOutline(element)
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
    existing(nextSibling) && parent.contains(nextSibling) ?
        parent.appendChild(placeholder) :
        parent.insertBefore(placeholder, nextSibling) // FIXME potential capability problem

    await nextFrame()
    await writePhase()
    if (tweeningExit.get(element) !== tweenID) {
        parent.removeChild(placeholder);
        return
    }
    placeholder.style.transition = calcTransitionCSS(duration, easing)
    placeholder.style.transform = toCSS(intermediate(origin, to))
    placeholder.style.opacity = `${to.opacity}`

    await forDuration(duration)
    await writePhase()
    parent.removeChild(placeholder)
}

export const tweeningExit: WeakMap<Element, TweenID> = new WeakMap()
