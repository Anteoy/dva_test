export default {

  namespace: 'example',
  // view <store.dispatch()是 View 发出 Action 的唯一方法。> action oldstatus <store.getStatus()> ==><reducer(in action,oldstatus) out newstatus> newstatus ==> store.subscribe()
  // Store 允许使用store.subscribe方法设置监听函数，一旦 State 发生变化，就自动执行这个函数 只要把 View 的更新函数（对于 React 项目，就是组件的render方法或setState方法）放入listen，就会实现 View 的自动渲染。
  // store.subscribe方法返回一个函数，调用这个函数就可以解除监听。
  // View 要发送多少种消息，就会有多少种 Action。如果都手写，会很麻烦。可以定义一个函数来生成 Action，这个函数就叫 Action Creator。
  // 实际应用中 store.dispatch方法会触发 Reducer 的自动执行。为此，Store 需要知道 Reducer 函数，做法就是在生成 Store 的时候，将 Reducer 传入createStore方法。
  state: {},

  subscriptions: {
    setup({ dispatch, history }) {  // eslint-disable-line
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {  // eslint-disable-line
      yield put({ type: 'save' });
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
