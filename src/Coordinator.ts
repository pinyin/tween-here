import {nextFrame} from '@pinyin/frame'
import {existing, notExisting} from '@pinyin/maybe'
import {centerOf, decompose, scale, toCSS, transform, translate} from '@pinyin/outline'
import {Tweenable} from './Tweenable'
import {TweenState} from './TweenState'
import {TweenStateDiff} from './TweenStateDiff'

class Coordinator {
    coordinate(element: Tweenable, position: Intent): void {
        this.updateChildrenMap(element)
        this.adjustChildren(element, position)
        this.scheduleCleanup()
    }

    // TODO extract this logic to @pinyin/outline
    private adjustChildren(element: Tweenable, intent: Intent): void {
        const children = this.childrenMap.get(element)
        if (notExisting(children)) {
            throw new Error(`Element ${element} is not being coordinated.`)
        }

        // TODO handle previous state
        const expectedPosition = this.intents.get(element)
        if (existing(expectedPosition)) {
            throw new Error(`not implemented`)
        }

        children.forEach(child => {
            const childIntent = this.intents.get(child)
            if (notExisting(childIntent)) {
                throw new Error(`Uninitialized ${child}.`)
            }

            const outer = decompose(intent.diff.transform)

            const deltaX = centerOf(childIntent.origin).x - centerOf(intent.origin).x
            const deltaY = centerOf(childIntent.origin).y - centerOf(intent.origin).y

            const newTransform = transform(
                scale(1 / outer.scale.x, 1 / outer.scale.y),
                translate(
                    -(deltaX * (outer.scale.x - 1)),
                    -(deltaY * (outer.scale.y - 1)),
                ),
                translate(
                    -outer.translate.x,
                    -outer.translate.y,
                ),
                childIntent.diff.transform,
            )

            // TODO support opacity
            child.style.transform = toCSS(newTransform)
        })

        this.intents.set(element, intent)
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
