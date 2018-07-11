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
    const root = document.body
    if (!initialized) {
        observer.observe(root, {childList: true, subtree: true})
        initialized = true
    }
    if (notExisting(element) || notExisting(root) || !root.contains(element)) {
        return
    }

    const acquireLock = lock.get(element)
    if (existing(acquireLock)) {
        try {
            acquireLock()
        } catch (e) {
            console.log(e)
        }
    }

    const from = getTweenState(element)
    if (!isInViewport(from)) {
        return
    }
    const placeholder = snapshotNode(element)
    placeholder.style.position = `absolute` // TODO more optimization

    let cleanup = () => { }
    const releaseLock = () => { cleanup() }
    lock.set(element, releaseLock)

    await new Promise((resolve, reject) => {
        listeners.set(element, () => {
            listeners.delete(element)
            resolve()
        })
        cleanup = () => {
            listeners.delete(element)
            reject()
        }
    })
    to = isFunction(to) ? to(from) : to
    if (notExisting(to)) {
        releaseLock()
        return
    }
    duration = isFunction(duration) ? duration(from, to) : duration
    root.appendChild(placeholder)
    cleanup = () => {
        if (placeholder.parentElement === root) {
            root.removeChild(placeholder)
        }
    }
    const current = getOriginOutline(placeholder)
    placeholder.style.transition = `none`
    placeholder.style.transform = toCSS(intermediate(current, from))
    placeholder.style.opacity = `${from.opacity}`

    await nextFrame()
    await writePhase()
    if (lock.get(element) !== releaseLock) {
        cleanup()
        return
    }
    placeholder.style.transition = calcTransitionCSS(duration, easing)
    placeholder.style.transform = toCSS(intermediate(current, to))
    placeholder.style.opacity = `${to.opacity}`

    await forDuration(duration)
    await writePhase()
    cleanup()
}

const lock: WeakMap<Element, () => void> = new WeakMap()

const listeners: WeakMap<Node, () => void> = new WeakMap()

let initialized: boolean = false // TODO find a better way to initialize
const observer: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
    const directlyRemovedNodes = mutations
        .filter(records => records.removedNodes.length > 0)
        .reduce(
            (acc, curr) => {
                arrayFromNodeList(curr.removedNodes).forEach(node => acc.add(node))
                return acc
            },
            new Set<Node>(),
        )
    const allRemovedNodes = new Set<Node>()
    directlyRemovedNodes.forEach(node => {
        const treeWalker = document.createTreeWalker(
            node,
            NodeFilter.SHOW_ELEMENT,
        )
        do {
            allRemovedNodes.add(treeWalker.currentNode)
        } while (treeWalker.nextNode())
    })
    allRemovedNodes.forEach(tweenable => {
        const callback = listeners.get(tweenable)
        if (callback) {
            callback()
        }
    })
})