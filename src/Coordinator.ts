import {nextFrame} from '@pinyin/frame'
import {compensate, Outline, toCSS, transform} from '@pinyin/outline'
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

        const rootCompensated = (child: Outline) => compensate(intent.origin, intent.diff, child)

        for (const path of paths as IterableIterator<Array<Tweenable>>) {
            const pathCompensated = path.reduce(
                (acc, curr) => {
                    const currIntent = this.intents.get(curr)!
                    currIntent.element.style.transition = intent.element.style.transition

                    return (child: Outline) => transform(
                        acc(currIntent.origin),
                        currIntent.diff,
                        compensate(
                            currIntent.origin,
                            currIntent.diff,
                            child,
                        )
                    )
                },
                rootCompensated,
            )

            const child = path[path.length - 1]
            const childIntent = this.intents.get(child)!
            child.style.transform = toCSS(transform(pathCompensated(childIntent.origin), childIntent.diff))
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
