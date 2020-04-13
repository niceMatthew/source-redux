import isPlainObject from "./utils/isPlainObjext";
import ActionTypes from "./utils/actionTypes";
/**
 * 
 * @param {*} reducer 状态处理函数
 * @param {*} preloadedState 初始状态
 */
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