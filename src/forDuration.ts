import {ms} from '@pinyin/types'

// TODO separate this into npm package
export function forDuration(time: ms): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, time))
}
