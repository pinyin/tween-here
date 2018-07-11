import {hasStyle} from '@pinyin/dom'
import {getOutline} from '@pinyin/outline'
import {TweenableElement} from './TweenableElement'
import {TweenState} from './TweenState'

export function getTweenState(element: TweenableElement): TweenState {
    const outline = getOutline(element)
    const opacityCSS = getComputedStyle(element).opacity
    const opacity = hasStyle(opacityCSS) ? parseFloat(opacityCSS) : 1

    return {
        ...outline,
        opacity
    }
}
