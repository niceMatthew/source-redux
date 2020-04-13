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