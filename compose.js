/**
 * 
 * @param  {...any} funcs 
 * @returns 包含从右向左执行的函数参数。比如，compose(f, g, h) 等同于 (...args) => f(g(h(...args)))
 */
export default function compose(...funcs) {
    if(funcs.length === 0) {
        return arg => arg
    }
    if(funcs.length === 1) {
        return funcs[0]
    }

    return funcs.reduce((a, b) => (...args) => a(b(...args)))
}