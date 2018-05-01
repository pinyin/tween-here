import {getOriginOutline} from '@pinyin/outline'
import {TweenState} from './TweenState'

export function getOriginalTweenState(element: HTMLElement): TweenState {
    const outline = getOriginOutline(element)
    return {
        ...outline,
        opacity: 1
    }
}
