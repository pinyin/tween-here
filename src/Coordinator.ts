import {nextFrame} from '@pinyin/frame'
import {Tweenable} from './Tweenable'
import {TweenState} from './TweenState'
import {TweenStateDiff} from './TweenStateDiff'

class Coordinator {
    private cleanupScheduled: boolean = false
    private elements: TweenableTree = new Map()

    adjustDescendants(element: Tweenable, expect: { state: TweenState, diff: TweenStateDiff }): void {
        putTweenableIntoTree(element, this.elements)


        this.scheduleCleanup()
    }

    private async scheduleCleanup(): Promise<void> {
        this.cleanupScheduled = true
        await nextFrame()
        if (this.cleanupScheduled) {
            return
        }
        this.cleanupScheduled = false
        this.elements = new Map()
    }
}

interface TweenableTree extends Map<Tweenable, TweenableTree | Tweenable> {}

export const COORDINATOR = new Coordinator()

function putTweenableIntoTree(element: Tweenable, tree: TweenableTree): void {

}
