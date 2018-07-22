import {nextFrame} from '@pinyin/frame'
import {compensate, identity, Outline, toCSS, Transform, transform} from '@pinyin/outline'
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

        const path = this.tree.ancestors(intent.element) as Array<Tweenable>
        const nearestFixedIndex =
            path.length - 1 -
            path
                .map(node => this.intents.get(node) || emptyIntent(node))
                .reverse()
                .findIndex(intent => intent.fixed)
        const pathToNearestFixed = path.slice(nearestFixedIndex, path.length)
        const intentToNearestFixed = this.compensateByPath(pathToNearestFixed, intent.origin)
        if (intent.fixed) {
            intent.element.style.transform = toCSS(transform(intentToNearestFixed, intent.diff))
        }

        const descendants = () => this.tree.DFS(intent.element, path => {
            const node = path[path.length - 1] as Tweenable
            const nodeIntent = this.intents.get(node) || emptyIntent(node)
            return node === intent.element ?
                NodeTravel.SKIP_SELF :
                nodeIntent.fixed ?
                    NodeTravel.SKIP_CHILDREN :
                    NodeTravel.SKIP_SELF
        })
        for (const path of descendants()) {
            const child = path[path.length - 1] as Tweenable
            const childIntent = this.intents.get(child) || emptyIntent(child)
            const childToIntent = this.compensateByPath(
                path.slice(0, path.length - 1)as Array<Tweenable>,
                childIntent.origin,
            )
            child.style.transform = toCSS(transform(
                intent.fixed ?
                    identity() :
                    transform(
                        intentToNearestFixed,
                        intent.diff,
                    ),
                childToIntent,
                childIntent.diff,
            ))
        }
    }

    private compensateByPath(path: ReadonlyArray<Tweenable>, leaf: Outline): Transform {
        const [root, ...pathToRoot] = path
        const rootIntent = this.intents.get(root) || emptyIntent(root)
        const result = pathToRoot.reduce(
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
            (child: Outline) => compensate(rootIntent.origin, rootIntent.diff, child),
        )
        return result(leaf)
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
