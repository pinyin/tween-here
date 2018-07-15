import {nextFrame} from '@pinyin/frame'
import {notExisting} from '@pinyin/maybe'
import {compensate, toCSS, transform} from '@pinyin/outline'
import {Tweenable} from './Tweenable'
import {TweenState} from './TweenState'
import {TweenStateDiff} from './TweenStateDiff'

class Coordinator {
    coordinate(element: Tweenable, position: Intent): void {
        this.updateChildrenMap(element)
        this.adjustChildren(element, position)
        this.scheduleCleanup()
    }

    private adjustChildren(parentElement: Tweenable, parentIntent: Intent): void {
        const childrenElements = this.childrenMap.get(parentElement)
        if (notExisting(childrenElements)) {
            throw new Error(`Element ${parentElement} is not being coordinated.`)
        }

        // TODO support change on parent relation
        childrenElements.forEach(childElement => {
            const childIntent = this.intents.get(childElement)
            if (notExisting(childIntent)) {
                throw new Error(`Uninitialized ${childElement}.`)
            }

            const compensateTransform =
                compensate(parentIntent.origin, parentIntent.diff, childIntent.origin)

            const newTransform = transform(
                compensateTransform,
                childIntent.diff,
            )

            // TODO support opacity
            childElement.style.transform = toCSS(newTransform)
        })

        this.intents.set(parentElement, parentIntent)
    }

    private updateChildrenMap(element: Tweenable): void {
        this.childrenMap.delete(element) // FIXME
        const children = new Set<Tweenable>()

        this.childrenMap
            .forEach((descendants, ancestor) => {
                if (ancestor.contains(element)) {
                    descendants.forEach(e => {
                        if (element.contains(e)) {
                            descendants.delete(e)
                        }
                    })
                }
                if (element.contains(ancestor)) {
                    children.add(ancestor)
                }
            })

        this.childrenMap.set(element, children)
    }

    private intents: Map<Tweenable, Intent> = new Map()
    private childrenMap: Map<Tweenable, Set<Tweenable>> = new Map()

    private async scheduleCleanup(): Promise<void> {
        this.cleanupScheduled = true
        await nextFrame()
        if (!this.cleanupScheduled) {
            return
        }

        this.intents = new Map()
        this.childrenMap = new Map()

        this.cleanupScheduled = false
    }

    private cleanupScheduled: boolean = false
}

export const COORDINATOR = new Coordinator()

export type Intent = {
    origin: TweenState
    diff: TweenStateDiff
}
