import {hasStyle} from '@pinyin/dom'
import {getOutline} from '@pinyin/outline'
import {Tweenable} from './Tweenable'
import {TweenState} from './TweenState'

export function getTweenState(element: Tweenable): TweenState {
    const outline = getOutline(element)
    const opacityCSS = getComputedStyle(element).opacity
    const opacity = hasStyle(opacityCSS) ? parseFloat(opacityCSS) : 1

    return {
        ...outline,
        opacity
    }
}
