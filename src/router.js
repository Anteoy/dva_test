import React from 'react';
import { Router, Route } from 'dva/router';
import Login from './routes/Login';
import NotFound from './routes/NotFound/index.js';

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      {/* index */}
      <Route path="/" component={Login} />
      {/* 登录页 */}
      <Route path="/login" component={Login} />
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
