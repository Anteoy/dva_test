import dva from 'dva';
import { setCookie, getCookie } from './utils/Cookies';
import { persistStore, autoRehydrate } from 'redux-persist';
import { browserHistory, hashHistory } from 'dva/router';
import './index.css';
const VNAME = 'wcVersion';
const version = __VERSION__ || '0.0.0';
// 暂时写法
let INITIALSTATE = {};
try {
  if (window) { // eslint-disable-line
    if ((getCookie('login'))) {
      const localVersion = getCookie(VNAME);
      if (localVersion && version === localVersion) {
        const loginInfo = JSON.parse(getCookie('login')) || {};
        if (loginInfo.token && loginInfo.phone) {
          INITIALSTATE.login = { ...JSON.parse(getCookie('login')), backURL: '' } || {}; // eslint-disable-line
        }
      } else {
        setCookie('login', JSON.stringify({}), -1);
        setCookie(VNAME, version, 10000);
      }
    }
    if (localStorage) {
      const localVersion = localStorage.getItem(VNAME);
      if (localVersion && version === localVersion) {
        if (localStorage.getItem('reduxPersist:login')) { // eslint-disable-line
          const loginInfo = JSON.parse(localStorage.getItem('reduxPersist:login')) || {};
          if (loginInfo.token && loginInfo.phone) {
            INITIALSTATE.login = { ...loginInfo, backURL: '' }; // eslint-disable-line
          }
        }
        if (localStorage.getItem('reduxPersist:init')) { // eslint-disable-line
          INITIALSTATE.init = JSON.parse(localStorage.getItem('reduxPersist:init')); // eslint-disable-line
        }
      } else {
        localStorage.removeItem('reduxPersist:login');
        localStorage.removeItem('reduxPersist:init');
        localStorage.setItem(VNAME, version);
      }
    }
  }
} catch (e) {
  INITIALSTATE = {};
  console.log('初始化数据错误：', e);
}
// alert(JSON.stringify(INITIALSTATE));
// 1. Initialize
const app = dva({
  initialState: INITIALSTATE,
  history: browserHistory,
  extraEnhancers: [autoRehydrate()],
});

app.model(require('./models/login'));

app.model(require('./models/index'));

// 2. Plugins
// app.use({});


// 3. Model
app.model(require('./models/init'));

// 4. Router
app.router(require('./router'));

// 5. Start
app.start('#root');

console.log(`%cENV: ${__ENV__}`, 'color:red');
console.log(`%cversion: ${__VERSION__}`,  'color:red');

persistStore(app._store, {
  whitelist: ['login', 'init'],
}, __ENV__ === 'develop' ? console.log : null);
