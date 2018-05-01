import {tweeningExit} from './tweenExit'
import {tweeningHere} from './tweenHere'

export function tweenEnd(element: HTMLElement): void {
    tweeningHere.delete(element)
    tweeningExit.delete(element)
    element.style.transition = 'none'
    element.style.transform = 'none'
}
