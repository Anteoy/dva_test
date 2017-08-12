import { routerRedux } from 'dva/router';
import { Toast } from 'antd-mobile';
import { setCookie } from '../utils/Cookies';
import { plogin, resetPwd, sendCode, user } from '../services/api';

let checked = false;

export default {
  namespace: 'pnoteLogin',
  state: {
    token: '',
    phone: '',
    grade: '',
    stuInfoStatus: -10000,
    user: {},
    source: 1, // 1 未知用户来源(以往用户) 1 具有学校资料的用户 2不具有学校资料的用户
    orderId: '',
    backURL: '',
    payFlag: 1,
  },
  reducers: {
    setBackURL(state, { backURL = '' }) {
      if (
        backURL !== '/' &&
        backURL !== '/login' &&
        backURL !== '/RestPwd' &&
        backURL !== '/entering'
      ) {
        console.warn('回调路由: ', backURL);
        // alert('setBackURL' + '     ' + JSON.stringify({ ...state, backURL }));
        return { ...state, backURL };
      }
      return state;
    },
    setStuInfoStatus(state, { stuInfoStatus }) {
      // alert('setStuInfoStatus' + '     ' + JSON.stringify( { ...state, stuInfoStatus }));
      return { ...state, stuInfoStatus };
    },
    setToken(state, { token, phone }) {
      try {
        let newState = state;
        if (token) {
          newState = { ...newState, token };
        }
        if (phone) {
          newState = { ...newState, phone };
        }
        setCookie('login', JSON.stringify(newState), 10000);
        // alert('setToken' + '     ' + JSON.stringify(newState));
        return newState;
      } catch (e) {
        console.log('setToken err', e);
        return { ...state, token, phone };
      }
    },
    setUser(state, { user, stuInfoStatus, orderId, source = 1, payFlag = 1 }) {
      const newUser = { ...state.user, ...user };
      let newState = { ...state, user: newUser, grade: newUser.grade_id, phone: newUser.phone, stuInfoStatus };
      if (orderId) {
        newState = { ...newState, orderId };
      }
      if (source) {
        newState = { ...newState, source };
      }
      if (payFlag) {
        newState = { ...newState, payFlag };
      }
      return newState;
    },
    setGrade(state, { grade }) {
      // alert('setGrade' + '     ' + JSON.stringify({ ...state, grade }));
      return { ...state, grade };
    },
    init(state) {
      try {
        const newState = {
          ...state,
          token: '',
          phone: '',
          grade: '',
          user: {},
          orderId: '',
          source: 1,
          stuInfoStatus: -10000,
          payFlag: 1,
        };
        setCookie('login', JSON.stringify(newState), 10000);
        return newState;
      } catch (e) {
        return {
          ...state,
          token: '',
          phone: '',
          grade: '',
          user: {},
          orderId: '',
          source: 1,
          stuInfoStatus: -10000,
          payFlag: 1,
        };
      }
    },
  },
  effects: {
    *goBack({ pathname }, { select, put }) {
      const { backURL, query } = yield select(({ login, routing: { locationBeforeTransitions = {} } }) => ({
        backURL: login.backURL,
        query: locationBeforeTransitions.query,
      }));
      // 回调路由
      if (backURL && pathname !== backURL) {
        yield put({ type: 'setBackURL', backURL: '' });
        yield put(routerRedux.replace({
          pathname: backURL,
          query,
        }));
      } else {
        yield put({ type: 'setBackURL', backURL: '' });
      }
    },
    /**
     * 检测是否登录
     * @param token
     * @param pathname
     * @param select
     * @param call
     * @param put
     */
      *loginHook({ token = '', pathname, query }, { select, put }) {
      try {
        const login = yield select(state => state.login); // eslint-disable-line
        const TOKEN = token || login.token;
        // if (__ENV__ === 'develop') {
        //   console.log('%c这个是develop环境：无token不跳转登录页也不鉴权', 'color:red');
        //   if (TOKEN) {
        //     yield put({ type: 'getUser', pathname, token: TOKEN });
        //   }
        //   return;
        // }
        // 无权限路由
        if (notAuthHook(pathname)) {
          return;
        }
        // 设置回调信息
        yield put({ type: 'setBackURL', backURL: pathname });
        // 没有token信息
        if (!TOKEN) {
          checked = true;
          yield put({ type: 'authHook', stuInfoStatus: -1000, pathname });
          return;
        }
        // 已有token信息
        if (TOKEN) {
          // 没有初始化过
          if (!checked) {
            checked = true;
            // alert(1111 + '     ' + TOKEN);
            yield put({ type: 'getUserHook', pathname, token: TOKEN });
          } else if (login.stuInfoStatus) {
            yield put({ type: 'authHook', stuInfoStatus: login.stuInfoStatus, pathname });
          }

          if (pathname === '/login' || pathname === '/') {
            if (login.stuInfoStatus) {
              yield put({ type: 'authHook', stuInfoStatus: login.stuInfoStatus, pathname });
            } else {
              yield put({ type: 'authHook', stuInfoStatus: -100, pathname });
            }
          }

          if (
            pathname === '/user' ||
            pathname === '/bought' ||
            pathname === '/payinfo'
          ) {
            yield put({ type: 'getUser', callback() { Toast.hide(); } });
          }
        }
        console.log(`__CLASS100TOKEN__:${TOKEN}`); // eslint-disable-line
      } catch (e) {
        checked = false;
        if (pathname !== '/login' && pathname !== '/') {
          yield put(routerRedux.replace({
            pathname: '/login',
            query,
          }));
        }
        yield put({ type: 'toast/hideToast' });
        yield put({
          type: 'toast/showToast',
          err: {
            type: 'fail',
            content: `${e.toString()}`,
            duration: 3,
          },
        });
      }
    },
    /**
     * 发信验证码
     * @param phone
     * @param select
     * @param call
     * @param put
     */
      *sendCode({ phone }, { call, put, select }) {
      try {
        let source = 1;
        const { query } = yield select(({ routing: { locationBeforeTransitions = {} } }) => ({
          query: locationBeforeTransitions.query,
        }));
        if (query.region === 'region') {
          source = 2;
        }
        const { err, data: res } = yield call(sendCode, { phone, source });
        if (err) {
          throw err;
        }
        if (res.code !== 200) {
          throw new Error(res.resultMsg);
        }
      } catch (e) {
        yield put({
          type: 'toast/showToast',
          err: {
            type: 'fail',
            content: `${e.toString()}`,
            duration: 3,
          },
        });
      }
    },
    /**
     * 手机号验证码注册
     * @param query
     * @param callback
     * @param select
     * @param call
     * @param put
     */
      *loginp({ query, _pathname, callback, dispatch }, { call, put, select }) {
      try {
        console.log('model login.js...')
        let source = 1;
        const { routeQuery } = yield select(({ routing, login }) => {
          return {
            pathname: routing.locationBeforeTransitions.pathname.pathname,
            backURL: login.backURL,
            routeQuery: routing.locationBeforeTransitions.query,
          };
        });
        if (routeQuery.region === 'region') {
          source = 2;
        }
        yield put({ type: 'loading', loading: true });
        const { err, data: res } = yield call(plogin, {
          ...query,
          source,
        });
        console.log(err)
        console.log(res)
        callback && callback();
        yield ({
          type: 'init/reTest',
          payload: {},
        });
        // 判断验证码
        if (err) {
          callback && callback();
          // throw err;
        }
        // if (res.code !== 200) {
        //   throw new Error(res.resultMsg);
        // }
        if (res.code === 400) {
          yield put({
            type: 'toast/showToast',
            err: {
              pwd: true,
            },
          });
          yield put({ type: 'loading', loading: false });
          return;
        }
        // yield put({ type: 'setToken', token: res.token, phone: query.phone });
        console.log(`diao yong callback!!!`); // eslint-disable-line
        // yield put({ type: 'getUserHook', pathname: _pathname || pathname, token: res.token });
        callback && callback();
      } catch (e) {
        callback && callback();
        yield put({
          type: 'toast/showToast',
          err: {
            type: 'fail',
            content: `${e.toString()}`,
            duration: 3,
          },
        });
      }
    },
    /**
     * 退出登录
     * @param query
     * @param callback
     * @param select
     * @param call
     * @param put
     */
      *logout({ code, callback }, { put, select }) {
      try {
        const { pathname, query } = yield select(({ routing: { locationBeforeTransitions = {} } }) => ({
          pathname: locationBeforeTransitions.pathname,
          query: locationBeforeTransitions.query,
        }));
        yield put({ type: 'init' });
        yield put(({
          type: 'init/reTest',
          payload: {},
        }));
        if (pathname !== '/login') {
          yield put(routerRedux.replace({
            pathname: '/login',
            query,
          }));
        }
        callback && callback();
      } catch (e) {
        callback && callback();
        yield put({
          type: 'toast/showToast',
          err: {
            type: 'fail',
            content: `${e.toString()}`,
            duration: 3,
          },
        });
      }
    },
    /**
     * 设置密码
     * @param query
     * @param select
     * @param call
     * @param put
     */
      *resetPwd({ query, callback }, { select, call, put }) {
      try {
        const { phone, token } = yield select(({ login }) => login);
        const { err, data: res } = yield call(resetPwd, {
          query: {
            ...query,
            phone: phone - 0,
          },
          token,
        });
        if (err) {
          throw err;
        }
        if (res.code !== 200) {
          if (res.code === 555) {
            callback && callback();
            yield put({ type: 'logout', code: res.code });
            throw new Error(res.resultMsg);
          }
          throw new Error(res.resultMsg);
        }
        yield put({ type: 'setStuInfoStatus', stuInfoStatus: 4 });
        yield put({ type: 'getUser', token });
        callback && callback(null);
      } catch (e) {
        callback && callback(e);
        yield put({
          type: 'toast/showToast',
          err: {
            type: 'fail',
            content: `${e.toString()}`,
            duration: 3,
          },
        });
      }
    },
    /**
     * 获取学生信息
     * @param query
     * @param select
     * @param call
     * @param put
     */
      *getUser({ query, callback }, { select, call, put }) {
      try {
        const { phone, token } = yield select(({ login }) => login);
        const { err, data: res } = yield call(user, {
          query: {
            ...query,
            phone: phone - 0,
          },
          token,
        });
        if (err) {
          throw err;
        }
        if (res.code !== 200) {
          throw new Error(res.resultMsg);
        }
        yield put({ type: 'setUser', user: res.data, stuInfoStatus: res.stuInfoStatus, orderId: res.orderId, source: res.source, payFlag: res.payFlag });
        yield put({ type: 'toast/hideToast' });
        callback && callback();
      } catch (e) {
        callback && callback();
        yield put({ type: 'toast/hideToast' });
        // yield put({ type: 'logout' });
        yield put({
          type: 'toast/showToast',
          err: {
            type: 'fail',
            content: `${e.toString()}`,
            duration: 3,
          },
        });
      }
    },
    /**
     * 检测服务端用户信息
     * @param token
     * @param pathname
     * @param select
     * @param call
     * @param put
     */
      *getUserHook({ pathname, token, callback }, { select, call, put }) {
      try {
        const login = yield select(state => state.login);
        const TOKEN = token || login.token;
        yield put({
          type: 'toast/showToast',
          err: {
            type: 'loading',
            content: '正在检测用户信息',
            duration: 0,
          },
        });
        if (!login.phone) {
          yield put({
            type: 'toast/showToast',
            err: {
              type: 'loading',
              content: '未知手机号',
              duration: 6,
            },
          });
          return;
        }
        const { err, data: res } = yield call(user, {
          query: {
            phone: login.phone - 0,
          },
          token: TOKEN,
        });
        if (err) {
          throw err;
        }
        if (res.code !== 200) {
          throw new Error(res.resultMsg);
        }
        yield put({ type: 'setUser', user: res.data, stuInfoStatus: res.stuInfoStatus, orderId: res.orderId, source: res.source, payFlag: res.payFlag });
        yield put({ type: 'toast/hideToast' });
        if (res.stuInfoStatus) {
          yield put({ type: 'authHook', stuInfoStatus: res.stuInfoStatus, pathname, token });
        }
        yield put({ type: 'sourceReload', source: 2 });
        if (res.source) {
          yield put({ type: 'sourceReload', source: res.source });
        }
      } catch (e) {
        yield put({ type: 'toast/hideToast' });
        yield put({ type: 'logout' });
        if (pathname === '/login') {
          return;
        }
        yield put({
          type: 'toast/showToast',
          err: {
            type: 'fail',
            content: `${e.toString()}`,
            duration: 3,
          },
        });
      }
    },
    /**
     * 检测用户信息状态
     * @param stuInfoStatus
     * @param pathname
     * @param select
     * @param call
     * @param put
     */
      *authHook({ stuInfoStatus, pathname, token }, { select, put }) {
      try {
        const { login, query } = yield select(({ login, routing: { locationBeforeTransitions = {} } }) => ({
          login,
          query: locationBeforeTransitions.query,
        }));
        const TOKEN = token || login.token;
        const status = stuInfoStatus || login.stuInfoStatus;
        if (!status) {
          throw new Error('无法获取用户状态：stuInfoStatus');
        }
        const user = login.user || {};
        // -1 用户不存在 1 未支付 2已支付
        if (login.payFlag && login.payFlag === 1) {

        }
        if (login.payFlag && login.payFlag === 2) {
          if (pathname === '/payinfo') {
            yield put(routerRedux.replace({
              pathname: '/bought',
              query: {
                ...query,
                token: TOKEN,
                outTradeNo: login.orderId,
              },
            }))
          }
        }
        // 无权限路由
        if (pathHook(pathname)) {
          return;
        }
        // false 无用户信息状态
        if (status === -100) {
          if (pathname !== '/user') {
            yield put(routerRedux.replace({
              pathname: '/user',
              query: {
                ...query,
                token: TOKEN,
              },
            }));
          }
        }
        // false 无用户信息状态
        if (status === -1000) {
          if (pathname !== '/login') {
            yield put(routerRedux.replace({
              pathname: '/login',
              query: {
                ...query,
                token: TOKEN,
              },
            }));
          }
        }
        // -1 无此用户信息
        if (status === -1) {
          if (pathname !== '/entering') {
            yield put(routerRedux.replace({
              pathname: '/entering',
              query: {
                ...query,
                token: TOKEN,
              },
            }));
          }
        }
        // 1 用户信息密码和班级已完成
        if (status === 1) {
          if (
            pathname === '/' ||
            pathname === '/login' ||
            pathname === '/RestPwd' ||
            pathname === '/setpay' ||
            pathname === '/entering'
          ) {
            if (query.region === 'region') {
              if (pathname !== '/course') {
                yield put(routerRedux.replace({
                  pathname: '/course',
                  query: {
                    ...query,
                    token: TOKEN,
                  },
                }));
              }
              return;
            }
            yield put(routerRedux.replace({
              pathname: '/user',
              query: {
                ...query,
                token: TOKEN,
              },
            }));
          }
        }
        // 2 用户密码未指定,用户班级未指定
        if (status === 2) {
          if (pathname !== '/RestPwd') {
            yield put(routerRedux.replace({
              pathname: '/RestPwd',
              query: {
                ...query,
                token: TOKEN,
              },
            }));
          }
        }
        // 3.用户密码未指定,班级已指定
        if (status === 3) {
          if (pathname !== '/RestPwd') {
            yield put(routerRedux.replace({
              pathname: '/RestPwd',
              query: {
                ...query,
                token: TOKEN,
              },
            }));
          }
        }
        // 4.用户密码已指定,班级未指定
        if (status === 4) {
          if (pathname !== '/entering') {
            yield put(routerRedux.replace({
              pathname: '/entering',
              query: {
                ...query,
                token: TOKEN,
              },
            }));
          }
        }
      } catch (e) {
        // yield put({ type: 'logout' });
        yield put({
          type: 'toast/showToast',
          err: {
            type: 'fail',
            content: `${e.toString()}`,
            duration: 3,
          },
        });
      }
    },
    *sourceReload({ source = 1 }, { select, put }) {
      try {
        const { login, pathname, query } = yield select(({ login, routing: { locationBeforeTransitions = {} } }) => ({
          login,
          pathname: locationBeforeTransitions.pathname,
          query: locationBeforeTransitions.query,
        }));
        // if (window && source === 1 && query.region) {
        //   let url = '';
        //   delete query.region;
        //   // window.location.href =
        //   yield put(routerRedux.replace({
        //     pathname,
        //     query,
        //   }));
        // }
        // if (window && source === 2 && query.region !== 'region') {
        //   let url = '';
        //   query.region = 'region';
        //   // window.location.href =
        //   yield put(routerRedux.replace({
        //     pathname,
        //     query,
        //   }));
        // }
      } catch (e) {
        yield put({
          type: 'toast/showToast',
          err: {
            type: 'fail',
            content: `${e.toString()}`,
            duration: 3,
          },
        });
      }

    },
  },
  // Store 允许使用store.subscribe方法设置监听函数，一旦 State 发生变化，就自动执行这个函数。
  // 只要把 View 的更新函数（对于 React 项目，就是组件的render方法或setState方法）放入listen，就会实现 View 的自动渲染。

  // subscription 是订阅，用于订阅一个数据源，然后根据需要 dispatch 相应的 action。在 app.start() 时被执行，数据源可以是当前的时间、服务器的 websocket 连接、keyboard 输入、geolocation 变化、history 路由变化等等。
  subscriptions: {
    // store.dispatch()是 View 发出 Action 的唯一方法。
    // store.dispatch接受一个 Action 对象作为参数，将它发送出去. store(包含)自动调用reducer.（接着出发listener（可能dva内置默认，进行自动渲染view））。
    init({ dispatch, history }) {
      return history.listen(({ query, pathname }) => {
        const { token = '' } = query;
        if (token) {
          dispatch({ type: 'setToken', token });
        }
        dispatch({ type: 'loginHook', pathname, query });
      });
    },
  },
};

function notAuthHook(path) {
  let err = false;
  switch (path) {
    case '/course':
      err = true;
      break;
    default:
      err = false;
  }
  return err;
}

function pathHook(path) {
  let err = false;
  switch (path) {
    case '/__TEST__':
      err = true;
      break;
    default:
      err = false;
  }
  return err;
}
