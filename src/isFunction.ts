// TODO extract this into separated package
export function isFunction(val: any): val is Function {
    return typeof val === 'function'
}
