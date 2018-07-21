import {identity} from '@pinyin/outline'
import {TransformIntent} from './TransformIntent'
import {Tweenable} from './Tweenable'

export function emptyIntent(target: Tweenable): TransformIntent {
    return {
        element: target,
        fixed: false,
        origin: {width: 1, x: 1, height: 1, y: 1},
        diff: identity(),
    }
}
