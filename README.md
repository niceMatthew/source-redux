最近研究了Redux源码，作为React技术栈中的一份子，保持了其特有的小巧专一。代码总共不过百来行，其中包含了状态机，发布订阅模式以及高阶函数的应用，也确实值得我们学习借鉴。（以下源码略作修改和注释）
## 1、三大原则
![](https://user-gold-cdn.xitu.io/2020/4/10/1716386e2be49778?w=638&h=479&f=png&s=118151)
### 单一数据源
整个应用的state被储存在一颗object tree中，并且这个object tree只存在于唯一
### State是只读的
唯一改变state的方法就是触发action, action是一个已发生事件的普通对象
### 使用纯函数来执行修改
为了描述action如何改变state tree,就需要reducer
## 源码目录
![](https://user-gold-cdn.xitu.io/2020/4/10/17163953ca875691?w=526&h=530&f=png&s=43507)
### util/isPlainObject
```
// 判断是不是纯对象，而非构造函数
export default function isPlainObject(obj) {
    if(typeof obj != 'object' || obj === null) {
        return false;
    }
    let proto = obj;
    // 取到obj最终_proto_指向
    while(Object.getPrototypeOf(proto)) {
        proto = Object.getPrototypeOf(proto)
    }
    return Object.getPrototypeOf(obj) === proto;
}
```
此纯对象的判断，判断对象最初的_proto_指向和_proto_最终指向的判断是否为同一个来判断

![](https://user-gold-cdn.xitu.io/2020/4/10/17163a295a6150fd?w=1692&h=446&f=png&s=80866)
### util/actionTypes.js
```
const ActionTypes = {
    INIT: '@@redux/INIT'
}
export default ActionTypes;
```
### createStore.js
作为redux中的C位，其中的方法包括getState, dispatch, subscribe方法
```
export default function createStore(reducer, preloadedState) {
    if(typeof reducer != 'function') {
        throw new Error('reducer不是函数')
    }
    let currentReducer = reducer; // 状态处理器
    let currentState = preloadedState; // 初始状态
    let currentListeners = []; // 监听函数队列
    function getState() {
        return currentState;
    }

    function dispatch(action) {
        if(!isPlainObject(action)) {
            throw new Error('action不是纯对象')
        }
        if(typeof action.type == 'undefined') {
            throw new Error('action的type未定义')
        }
        // 获取当前state
        currentState = createReducer(currentState, action);
        // 发布订阅模式
        for(let i=0; i<currentListeners.length; i++) {
            const listener = currentListeners[i];
            listener();
        }
        return action;
    }

    // 订阅
    function subscribe(listener) {
        let subscribed = true;
        currentListeners.push(listener);
        // 取消订阅
        return function unsubscribe() {
            // 重复订阅优化
            if(!subscribed) {
                return ;
            }
            const index = currentListeners.indexOf(listener);
            currentListeners.splice(index, 1);
            subscirbed = false;
        }
    }

    // 创建store初始化值
    dispatch({type:ActionTypes.INIT});

    return {
        getState,// 返回状态
        dispatch,// 派发动作
        subscirbe
    }
}
```
### combineReducers.js
将多个reducer合并到一个对象中，方便维护
```
export default function(reducers) {
    // 返回reducers名称的数组
    const reducerKeys = Object.keys(reducers);
    return function (state = {}, action) {
        const nextState = {}; 
        for(let i = 0; i < reducerKeys.length; i++) {
            const key = reducerKeys[i];
            const reducer = reducers[key];
            const previousStateForKey = state[key]; // 老状态
            const nextStateForKey = reducer(previousStateForKey, action); // 新状态
            nextState[key] = nextStateForKey;
        }
        return nextState;
    }
}
```
### bindActionCreators.js
将dispatch整合到action中
```
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
```
### compose.js
这一块灵活应用了reduce方法和高阶函数，实现参数函数从右向左执行
```
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
```
### applyMiddleware.js
```
import compose from './compose'

export default function applyMiddleware(...middlewares) {
    return createStore => (...args) => {
        const store = createStore(...args)
        let dispatch = () => {
            throw new Error('构造中间键的时候不能运行dispatch,否则其他中间键将接收不到dispatch')
        }
        const middlewareAPI = {
            getState: store.getState,
            dispatch: (...args) => dispatch(...args)
        }
    
        const chain = middlewares.map(middleware => middleware(middlewareAPI))
        dispatch = compose(...chain)(store.dispatch)
    
        return {
            ...store,
            dispatch
        }
    }
}
```
### index.js
```
import createStore from './createStore';
import combineReducers from './combineReducers';
import bindActionCreators from './bindActionCreators';
import applyMiddleware from './applyMiddleware';
export {
    createStore,//创建仓库
    combineReducers,//合并reducers
    bindActionCreators,//把actionCreator 和 dispatch方法绑定在一起
    applyMiddleware
}
```
## 中间键实践
### redux-thunk中间键实现
```
function createThunkMiddleware(extraArgument) {
    return ({dispatch, getState}) => next => action => {
        if(typeof action === 'function') {
            return action(dispatch, getState, extraArgument)
        } else {
            next(action)
        }
    }
}
const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;
```
### redux-promise
```
// Promise判断:有then方法的函数对象
function isPromise(obj) {
    return !obj&&(typeof obj == 'object' || typeof obj == 'function') && (typeof obj.then == 'function')
}

export default function({dispatch, getState}) {
    return next => action => {
        return isPromise(action.payload)? action.payload.then(result => {
            dispatch({...action, payload: result})
        }).catch((error) => {
            dispatch({...action, payload:error, error: true});
            return Promise.reject(error)
        }) : next(action)
    }
}
```