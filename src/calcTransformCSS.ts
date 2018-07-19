import {intermediate, Outline, toCSS} from '@pinyin/outline'

export function calcTransformCSS(from: Outline, to: Outline): string {
    const matrix = intermediate(from, to)
    return toCSS(matrix)
}
