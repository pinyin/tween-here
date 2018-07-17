import {nextFrame} from '@pinyin/frame'
import {assume, notExisting} from '@pinyin/maybe'
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

    private adjustChildren(rootElement: Tweenable, rootIntent: Intent): void {
        for (const path of this.influencePath(rootElement)) {
            let compensatedTransform = identity()

            let ancestorParentIntent = rootIntent
            for (const element of path) {
                const elementIntent = this.intents.get(element)
                if (notExisting(elementIntent)) {
                    throw new Error(`Uninitialized ancestor.`)
                }

                compensatedTransform = transform(
                    compensatedTransform,
                    compensate(
                        ancestorParentIntent.origin,
                        ancestorParentIntent.diff,
                        elementIntent.origin,
                    ),
                    elementIntent.diff,
                )

                ancestorParentIntent = elementIntent
                element.style.transition = rootElement.style.transition
            }

            // opacity cannot be supported
            const child = path[path.length - 1]
            child.style.transform = toCSS(compensatedTransform)
        }

        this.intents.set(rootElement, rootIntent)
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
                yield* [...this.influencePath(child)]
                    .filter(path =>
                        assume(this.intents.get(path[path.length - 1]), it => it.fixed),
                    )
                    .map(path => [child, ...path])
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
