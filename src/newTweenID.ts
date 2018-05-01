import {TweenID} from './TweenID';

// https://stackoverflow.com/a/44078785/1815491
export function newTweenID(): TweenID {
    return Math.random().toString(36).substring(2)
        + (new Date()).getTime().toString(36);
}
