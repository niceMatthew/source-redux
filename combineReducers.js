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