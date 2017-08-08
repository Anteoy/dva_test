import React from 'react';
import { Router, Route } from 'dva/router';
import Login from './routes/Login';
import NotFound from './routes/NotFound/index.js';
import User from './routes/User';
import PnoteIndex from './components/pnote_login';


function RouterConfig({ history }) {
  return (
    <Router history={history}>
      {/* index */}
      <Route path="/" component={Login} />
      {/* 登录页 */}
      <Route path="/login" component={Login} />
      {/* 已有用户信息 */}
      <Route path="/user" component={User} />
      {/* pnote 登录 */}
      <Route path="/pnote_index" component={PnoteIndex} />
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
