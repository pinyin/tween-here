import {applyTransform} from '@pinyin/outline'
import {TweenState} from './TweenState'
import {TweenStateDiff} from './TweenStateDiff'

export function applyDiff(state: TweenState, diff: TweenStateDiff): TweenState {
    return {
        ...applyTransform(state, diff.transform),
        opacity: state.opacity + diff.opacityDelta,
    }
}
