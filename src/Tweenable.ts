export type Tweenable = HTMLElement | SVGElement

export function isTweenable(obj: any): obj is Tweenable {
    return obj instanceof HTMLElement || obj instanceof SVGElement
}
