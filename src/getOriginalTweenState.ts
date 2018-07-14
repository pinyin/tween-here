import {getOriginOutline} from '@pinyin/outline'
import {Tweenable} from './Tweenable'
import {TweenState} from './TweenState'

export function getOriginalTweenState(element: Tweenable): TweenState {
    const outline = getOriginOutline(element)
    return {
        ...outline,
        opacity: 1
    }
}
