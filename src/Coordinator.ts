import {nextFrame} from '@pinyin/frame'
import {compensate, Outline, toCSS, transform} from '@pinyin/outline'
import {emptyIntent} from './emptyIntent'
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

        const descendants = () => this.tree.DFS(intent.element, path => {
            const node = path[path.length - 1] as Tweenable
            const nodeIntent = this.intents.get(node) || emptyIntent(node)
            return node === intent.element ?
                NodeTravel.SKIP_SELF :
                nodeIntent.fixed ?
                    NodeTravel.SKIP_CHILDREN :
                    NodeTravel.SKIP_SELF
        })

        for (const path of descendants()) { // TODO extract to @pinyin/outline
            const pathToIntent = path.slice(0, path.length - 1) as Array<Tweenable>
            const child = path[path.length - 1] as Tweenable

            const compensateToIntent = pathToIntent.reduce(
                (compensateByPath, curr) => {
                    const currIntent = this.intents.get(curr) || emptyIntent(curr)

                    return (child: Outline) => transform(
                        compensateByPath(currIntent.origin),
                        currIntent.diff,
                        compensate(
                            currIntent.origin,
                            currIntent.diff,
                            child,
                        ),
                    )
                },
                (child: Outline) => compensate(intent.origin, intent.diff, child),
            )

            const childIntent = this.intents.get(child)!
            child.style.transform = toCSS(transform(
                compensateToIntent(childIntent.origin),
                childIntent.diff,
            ))
        }
    }

    private readonly intents: Map<Node, TransformIntent> = new Map()
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
