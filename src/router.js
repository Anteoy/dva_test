import React from 'react';
import { Router, Route } from 'dva/router';
import Login from './routes/Login';
import NotFound from './routes/NotFound/index.js';
import User from './routes/User';
import PnoteIndex from './components/pnote_login';
import PnoteHome from './components/pnote_home';


function RouterConfig({ history }) {
  return (
    <Router history={history}>
      {/* index */}
      <Route path="/test" component={Login} />
      {/* 登录页 */}
      <Route path="/login" component={Login} />
      {/* 已有用户信息 */}
      <Route path="/user" component={User} />
      {/* pnote 登录 */}
      <Route path="/" component={PnoteIndex} />
      {/* pnote 主页 */}
      <Route path="/pnote_home" component={PnoteHome} />
      {
        __ENV__ === 'develop' ? (
          <Route
            path="*" onEnter={(route, replace) => {
              replace('/login');
            }} component={NotFound}
          />
        ) : null
      }
    </Router>
  );
}

export default RouterConfig;
