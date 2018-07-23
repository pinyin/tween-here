import {existing} from '@pinyin/maybe'

// TODO over optimize
export class NodeTree {
    insert(node: Node): void {
        const parent = this.findParent(node)
        const children = new Set<Node>()

        const prevParent = this.parentMap.get(node)
        if (existing(prevParent) && parent !== prevParent) {
            throw new UnexpectedStructure()
        }

        if (existing(parent)) {
            this.parentMap.set(node, parent)
            const adjacents = this.childrenMap.get(parent)!
            new Set(adjacents).forEach(adjacent => {
                if (node.contains(adjacent)) {
                    children.add(adjacent)
                    adjacents.delete(adjacent)
                }
            })
            adjacents.add(node)
        }

        this.childrenMap.set(node, children)
    }

    findParent(node: Node): Node | undefined {
        const ancestorPaths = this.DFS(document.body, path =>
            path[path.length - 1].contains(node) ?
                Skip.ADJACENTS :
                Skip.SUBTREE,
        )

        let parentPath: Node | undefined
        for (const path of ancestorPaths) {
            parentPath = path[path.length - 1]
        }

        return parentPath
    }

    ancestors(node: Node): Array<Node> {
        const result: Array<Node> = []
        for (let parent = this.parentMap.get(node);
             parent;
             parent = this.parentMap.get(parent)) {
            result.unshift(parent)
        }
        return result
    }

    * DFS(node: Node, filter: TravelFilter = () => Accept, nodePath: Path = [node]): IterableIterator<Path> {
        const skipSpec = filter(nodePath)
        if (!(skipSpec & Skip.SELF)) {
            yield nodePath
        }
        if (!(skipSpec & Skip.CHILDREN)) {
            const children = this.childrenMap.get(node)!
            for (const child of children) {
                const childPath = [...nodePath, child]
                yield* this.DFS(child, filter, childPath)
                if (filter(childPath) & Skip.ADJACENTS) {
                    break
                }
            }
        }
    }

    children(node: Node): ReadonlySet<Node> {
        return this.childrenMap.get(node) || new Set()
    }

    has(node: Node): boolean {
        return existing(this.childrenMap.get(node))
    }

    isEmpty(): boolean {
        return this.childrenMap.size === 1 && this.parentMap.size === 0
    }

    size(): number {
        return this.childrenMap.size - 1
    }

    clear(): void {
        this.parentMap.clear()
        this.childrenMap.clear()
        this.childrenMap.set(document.body, new Set())
    }

    private readonly parentMap: Map<Node, Node> = new Map()
    private readonly childrenMap: Map<Node, Set<Node>> = new Map([[document.body, new Set()]])
}

export const Accept = 0

export enum Skip {
    SELF = 1,
    CHILDREN = 2,
    ADJACENTS = 4,
    SUBTREE = SELF | CHILDREN,
}

export type TravelFilter = (path: ReadonlyArray<Node>) => Skip
export type Path = ReadonlyArray<Node>

export class UnexpectedStructure extends Error {}
