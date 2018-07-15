import {intermediate} from '@pinyin/outline'
import {TweenState} from './TweenState'
import {TweenStateDiff} from './TweenStateDiff'

export function intermediateTweenState(from: TweenState, to: TweenState): TweenStateDiff {
    return {
        ... intermediate(from, to),
        opacity: to.opacity - from.opacity,
    }
}
