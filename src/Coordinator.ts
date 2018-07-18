import {nextFrame} from '@pinyin/frame'
import {compensate, identity, toCSS, Transform, transform} from '@pinyin/outline'
import {NodeTravel, NodeTree} from './NodeTree'
import {TransformIntent} from './TransformIntent'
import {Tweenable} from './Tweenable'

class Coordinator {
    coordinate(intent: TransformIntent): void {
        this.adjustChildren(intent)
        this.scheduleCleanup()
    }

    private adjustChildren(intent: TransformIntent): void {
        this.tree.insert(intent.element)
        this.intents.set(intent.element, intent)

        const paths = this.tree.DFS(intent.element, element =>
            element === intent.element ?
                NodeTravel.SKIP :
                this.intents.get(element as Tweenable)!.fixed ?
                    NodeTravel.ACCEPT :
                    NodeTravel.SKIP,
        )

        for (const path of paths as IterableIterator<Array<Tweenable>>) {
            const compensatedTransform = path.reduce(
                ([parentIntent, parentCompensation], curr) => {
                    const childIntent = this.intents.get(curr)!

                    const childCompensation = transform(
                        parentCompensation,
                        compensate(
                            parentIntent.origin,
                            parentIntent.diff,
                            childIntent.origin,
                        ),
                        childIntent.diff,
                    )

                    childIntent.element.style.transition = intent.element.style.transition
                    return [childIntent, childCompensation] as [TransformIntent, Transform]
                },
                [intent, identity()] as [TransformIntent, Transform],
            )[1]

            const child = path[path.length - 1]
            child.style.transform = toCSS(compensatedTransform)
        }
    }

    private readonly intents: Map<Tweenable, TransformIntent> = new Map()
    private readonly tree = new NodeTree()

    private async scheduleCleanup(): Promise<void> {
        await nextFrame()

        if (this.tree.isEmpty() && this.intents.size === 0) {
            return
        }

        this.intents.clear()
        this.tree.clear()
    }
}

export const COORDINATOR = new Coordinator()

type Path = ReadonlyArray<Tweenable>
