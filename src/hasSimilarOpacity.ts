import {TweenState} from './TweenState'

export function hasSimilarOpacity(from: TweenState, to: TweenState): boolean {
    return Math.abs(from.opacity - to.opacity) <= 0.05
}
