import {inverse} from '@pinyin/outline'
import {TweenStateDiff} from './TweenStateDiff'

export function inverseDiff(diff: TweenStateDiff): TweenStateDiff {
    return {
        transform: inverse(diff.transform),
        opacityDelta: -diff.opacityDelta,
    }
}
