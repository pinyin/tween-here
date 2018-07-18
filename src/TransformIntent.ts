import {Outline, Transform} from '@pinyin/outline'
import {Tweenable} from './Tweenable'

export type TransformIntent = {
    element: Tweenable
    origin: Outline
    diff: Transform
    fixed: boolean
}
