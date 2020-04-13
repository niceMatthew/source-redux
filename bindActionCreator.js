function bindActionCreator(actionCreator, dispatch) {
    return function() {
        return dispatch(actionCreator.apply(this, arguments))
    }
}
/**
 * 
 * @param {Function|Object} actionCreators 
 * @param {Function} dispatch  对redux Store生效的dispatch方法
 * @returns {Function|Object} 如果返回对象的话类似与原始对象，但是每个对象元素添加了dispatch方法
 */
export default function bindActionCreators(actionCreators, dispatch) {
    if(typeof actionCreators === 'function') {
        return bindActionCreator(actionCreators, dispatch)
    }
    if(typeof actionCreators !== 'object' || actionCreators === null) {
        throw new Error(
            `bindActionCreators应该是一个对象或者函数类型, 而不是接收到${
                actionCreators === null ? 'null' : typeof actionCreators
              }. ` +
                `是不是这样引用 "import ActionCreators from" 而不是 "import * as ActionCreators from"?`
        )
    }

    // actionCreators为对象的时候
    const boundActionCreators = {}
    for (const key in actionCreators) {
        const actionCreator = actionCreators[key]
        if (typeof actionCreator === 'function') {
            boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
        }
    }
    return boundActionCreators
}