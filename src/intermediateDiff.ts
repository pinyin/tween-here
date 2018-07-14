import {composeDiff} from './composeDiff'
import {inverseDiff} from './inverseDiff'
import {TweenStateDiff} from './TweenStateDiff'

export function intermediateDiff(from: TweenStateDiff, to: TweenStateDiff): TweenStateDiff {
    return composeDiff(inverseDiff(from), to)
}
