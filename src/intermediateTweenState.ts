import {intermediate} from '@pinyin/outline'
import {TweenState} from './TweenState'
import {TweenStateDiff} from './TweenStateDiff'

export function intermediateTweenState(from: TweenState, to: TweenState): TweenStateDiff {
    return {
        transform: intermediate(from, to),
        opacityDelta: to.opacity - from.opacity,
    }
}
