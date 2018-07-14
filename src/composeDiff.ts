import {transform} from '@pinyin/outline'
import {TweenStateDiff} from './TweenStateDiff'

export function composeDiff(a: TweenStateDiff, b: TweenStateDiff): TweenStateDiff {
    return {
        opacityDelta: a.opacityDelta + b.opacityDelta,
        transform: transform(a.transform, b.transform),
    }
}
