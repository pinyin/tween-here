import {ms} from '@pinyin/types'
import {CubicBezierParam} from './CubicBezierParam'

export function calcTransitionCSS(duration: ms, easing: CubicBezierParam): string {
    return `
        opacity ${duration}ms cubic-bezier(${easing.join(',')}),
        transform ${duration}ms cubic-bezier(${easing.join(',')}),
        filter ${duration}ms cubic-bezier(${easing.join(',')}),
        -webkit-filter ${duration}ms cubic-bezier(${easing.join(',')})
    `
}
