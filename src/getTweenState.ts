import {hasStyle} from '@pinyin/dom'
import {getOutline} from '@pinyin/outline'
import {TweenState} from './TweenState'

export function getTweenState(element: HTMLElement): TweenState {
    const outline = getOutline(element)
    const opacityCSS = getComputedStyle(element).opacity
    const opacity = hasStyle(opacityCSS) ? parseFloat(opacityCSS) : 1

    return {
        ...outline,
        opacity
    }
}
