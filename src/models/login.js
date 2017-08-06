import { routerRedux } from 'dva/router';
import { Toast } from 'antd-mobile';
import { setCookie } from '../utils/Cookies';
import { login, resetPwd, addStudent, sendCode, user } from '../services/api';

let checked = false;

export default {
  namespace: 'login',
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
    *login({ query, _pathname, callback }, { call, put, select }) {
      try {
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
        const { err, data: res } = yield call(login, {
          ...query,
          source,
        });

        yield ({
          type: 'init/reTest',
          payload: {},
        });
        // 判断验证码
        if (err) {
          throw err;
        }
        if (res.code !== 200) {
          throw new Error(res.resultMsg);
        }
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
        yield put({ type: 'setToken', token: res.token, phone: query.phone });
        console.log(`__TDTOKEN__:${res.token}`); // eslint-disable-line
        yield put({ type: 'getUserHook', pathname: _pathname || pathname, token: res.token });
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
    *sourceReload({ source = 1 }, { select, put }) {
      try {
        const { login, pathname, query } = yield select(({ login, routing: { locationBeforeTransitions = {} } }) => ({
          login,
          pathname: locationBeforeTransitions.pathname,
          query: locationBeforeTransitions.query,
        }));
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
  subscriptions: {
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
