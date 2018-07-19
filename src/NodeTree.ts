import {existing} from '@pinyin/maybe'

export class NodeTree {
    insert(node: Node): void {
        if (this.has(node)) {
            throw new UnexpectedStructure()
        }

        const findParent = (): Node | undefined => {
            const ancestorPaths = this.DFS(document.body, candidate =>
                candidate.contains(node) ?
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

    * DFS(node: Node, filter: TravelFilter = () => NodeTravel.ACCEPT): IterableIterator<Path> {
        if (filter(node) !== NodeTravel.SKIP) {
            yield [node]
        }
        if (filter(node) !== NodeTravel.SKIP_CHILDREN) {
            const children = this.childrenMap.get(node)!
            for (const child of children) {
                if (filter(child) !== NodeTravel.REJECT) {
                    for (const subpath of this.DFS(child, filter)) {
                        yield [node, ...subpath]
                    }
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

export enum NodeTravel {
    ACCEPT,
    SKIP,
    REJECT,
    SKIP_CHILDREN
}

export type TravelFilter = (path: Readonly<Node>) => NodeTravel
export type Path = Array<Node>

export class UnexpectedStructure extends Error {}
