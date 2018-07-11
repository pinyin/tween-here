export type TweenableElement = HTMLElement | SVGElement

export function isTweenableElement(obj: any): obj is TweenableElement {
    return obj instanceof HTMLElement || obj instanceof SVGElement
}