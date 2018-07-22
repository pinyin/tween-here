import {existing} from '@pinyin/maybe'

// TODO over optimize
export class NodeTree {
    insert(node: Node): void {
        if (this.childrenMap.has(node)) {
            throw new UnexpectedStructure()
        }
        const findParent = (): Node | undefined => {
            const ancestorPaths = this.DFS(document.body, path =>
                path[path.length - 1].contains(node) ?
                    NodeTravel.ACCEPT :
                    NodeTravel.REJECT,
            )

            let parentPath: Array<Node> = []
            for (const path of ancestorPaths) {
                if (path.length < parentPath.length) {
                    break
                }
                parentPath = path
            }

            return parentPath[parentPath.length - 1]
        }

        const parent = findParent()
        const children = new Set<Node>()

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

    ancestors(node: Node): Array<Node> {
        const result: Array<Node> = []
        for (let parent = this.parentMap.get(node);
             existing(parent);
             parent = this.parentMap.get(parent)) {
            result.unshift(parent)
        }
        return result
    }

    * DFS(node: Node, filter: TravelFilter = () => NodeTravel.ACCEPT, ancestors: ReadonlyArray<Node> = []): IterableIterator<Path> {
        const path = [...ancestors, node]
        if (filter(path) === NodeTravel.REJECT) {
            return
        }
        if (filter(path) !== NodeTravel.SKIP_SELF) {
            yield path
        }
        if (filter(path) !== NodeTravel.SKIP_CHILDREN) {
            const children = this.childrenMap.get(node)!
            for (const child of children) {
                yield* this.DFS(child, filter, [...path, child])
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

export enum NodeTravel {
    ACCEPT,
    SKIP_SELF,
    REJECT,
    SKIP_CHILDREN
}

export type TravelFilter = (path: ReadonlyArray<Node>) => NodeTravel
export type Path = Array<Node>

export class UnexpectedStructure extends Error {}
