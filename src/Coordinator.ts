import {nextFrame} from '@pinyin/frame'
import {notExisting} from '@pinyin/maybe'
import {compensate, identity, toCSS, transform} from '@pinyin/outline'
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
        for (const path of this.influencePath(parentElement)) {
            const childElement = path[path.length - 1]
            const ancestors = path.slice(0, path.length)
            if (notExisting(childElement)) {
                throw new Error('Unexpected path.')
            }
            const childIntent = this.intents.get(childElement)
            if (notExisting(childIntent)) {
                throw new Error(`Uninitialized element.`)
            }

            let compensateTransform = identity()

            let ancestorParentIntent = parentIntent
            for (const ancestor of ancestors) {
                const ancestorIntent = this.intents.get(ancestor)
                if (notExisting(ancestorIntent)) {
                    throw new Error(`Uninitialized ancestor.`)
                }

                compensateTransform = transform(
                    compensate(
                        ancestorParentIntent.origin,
                        ancestorParentIntent.diff,
                        ancestorIntent.origin,
                    ),
                    compensateTransform,
                )

                ancestorParentIntent = ancestorIntent
            }

            const newTransform = transform(
                compensateTransform,
                childIntent.diff,
            )
            // opacity cannot be supported
            // TODO override transition & easing?
            childElement.style.transform = toCSS(newTransform)
        }

        this.intents.set(parentElement, parentIntent)
    }

    private* influencePath(element: Tweenable): IterableIterator<Path> {
        const children = this.childrenMap.get(element)
        if (notExisting(children)) {
            throw new Error(`Unexpected parent.`)
        }

        for (const child of children) {
            const childIntent = this.intents.get(child)
            if (notExisting(childIntent)) {
                throw new Error(`Unexpected child.`)
            }

            if (childIntent.fixed) {
                yield [child]
            } else {
                yield* [...this.influencePath(child)].map(path => [child, ...path])
            }
        }
    }

    private updateChildrenMap(element: Tweenable): void {
        this.childrenMap.delete(element)
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
    fixed: boolean
}

type Path = ReadonlyArray<Tweenable>
