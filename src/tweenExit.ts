import {arrayFromNodeList} from '@pinyin/dom'
import {nextFrame, writePhase} from '@pinyin/frame'
import {existing, Maybe, notExisting} from '@pinyin/maybe'
import {getOriginOutline, intermediate, isInViewport, toCSS} from '@pinyin/outline'
import {ms, nothing} from '@pinyin/types'
import {snapshotNode} from 'snapshot-node'
import {calcTransitionCSS} from './calcTransitionCSS'
import {CubicBezierParam} from './CubicBezierParam'
import {forDuration} from './forDuration'
import {getTweenState} from './getTweenState'
import {isFunction} from './isFunction'
import {TweenableElement} from './TweenableElement'
import {TweenState} from './TweenState'

// FIXME don't animate invisible element
export async function tweenExit(
    element: Maybe<TweenableElement>,
    to: Maybe<TweenState> | ((from: TweenState) => Maybe<TweenState>) = nothing,
    duration: ms | ((from: TweenState, to: TweenState) => ms) = 200,
    easing: CubicBezierParam = [0, 0, 1, 1],
): Promise<void> {
    const parent = document.body
    if (notExisting(element) || notExisting(parent) || !parent.contains(element)) {
        return
    }
    const terminatePreviousTween = lock.get(element)
    if (existing(terminatePreviousTween)) {
        try {
            terminatePreviousTween()
        } catch (e) {
            console.log(e)
        }
    }

    const from = getTweenState(element)
    if (!isInViewport(from)) {
        return
    }
    const placeholder = snapshotNode(element) as TweenableElement
    placeholder.style.position = `absolute` // TODO more optimization

    let cleanup = () => { }
    const terminate = () => { cleanup() }
    lock.set(element, terminate)

    await new Promise(
        (resolve, reject) => {
            const observer = new MutationObserver((mutations: MutationRecord[]) => {
                const isElementDeleted = mutations
                    .filter(mutation =>
                        arrayFromNodeList(mutation.removedNodes)
                            .filter(node => node.contains(element))
                            .length > 0,
                    )
                    .length > 0 // TODO is this necessary?
                if (isElementDeleted) {
                    cleanup = () => { }
                    resolve()
                    observer.disconnect()
                }
            })
            observer.observe(parent, {childList: true, subtree: true}) // FIXME optimize performance for large dom
            cleanup = () => {
                observer.disconnect()
                reject()
            }
        },
    )
    to = isFunction(to) ? to(from) : to
    if (notExisting(to)) {
        terminate()
        return
    }
    duration = isFunction(duration) ? duration(from, to) : duration
    parent.appendChild(placeholder)
    cleanup = () => { if (placeholder.parentElement === parent) { parent.removeChild(placeholder) } }
    const current = getOriginOutline(placeholder)
    placeholder.style.transition = `none`
    placeholder.style.transform = toCSS(intermediate(current, from))
    placeholder.style.opacity = `${from.opacity}`

    await nextFrame()
    await writePhase()
    if (lock.get(element) !== terminate) {
        terminate()
        return
    }
    placeholder.style.transition = calcTransitionCSS(duration, easing)
    placeholder.style.transform = toCSS(intermediate(current, to))
    placeholder.style.opacity = `${to.opacity}`

    await forDuration(duration)
    await writePhase()
    parent.removeChild(placeholder)
}

const lock: WeakMap<Element, () => void> = new WeakMap()
