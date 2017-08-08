import React from 'react';
import { connect } from 'dva';
import styles from './pnoteLogin.css';

class PnoteIndex extends React.Component {
  state = {
    username: '',
    passwd: '',
  };
  render() {
    const { phone, pwd, hasSet, phoneErr, pwdErr, visible } = this.state;
    const { login } = this.props;
    const { ERROR } = login;
    return (
      <div>

        <div className="top-nav">
          <ul>
            <li><a href="/" />Index</li>
            <li><a href="/blog.html" >Blog</a></li>
            <li><a href="/archive.html">Date</a></li>
            <li><a href="/classify.html" >Classify</a></li>
            <li><a href="/pages/about.html" >About</a></li>
            <li><a href="/pnotelogin.html" className="on-sel">Pnote</a></li>

            <li><a href="https://github.com/Anteoy/liongo" target="_blank">github</a></li>

          </ul>
        </div>
        <div></div>
        <div className={styles.main} >
          <div className={styles.main_container} >
            <div className={styles.loginContent}>
              <span className={styles.firstLogin}>admin or guest 账户登录</span>
              <div >
                <input type="text" placeholder="用户名" id="username" />
              </div>
              <div >
                <input type="password" placeholder="密码" id="password"  />
              </div>
              <div >
                <input type="checkbox"  className={styles.loginRember} /> <span className={styles.loginRemberWord}>记住密码</span>
              </div>
              <div  className={styles.loginBtn} id="commit" >
                登&nbsp录
              </div>
            </div>
          </div>
        </div>
        <div id="footer">
          <div id="footer-inner">
            <p id="copyright">Copyright (c) 2016 - 2017 owner of copyright &nbsp;
              Powered by <a href="https://github.com/Anteoy/liongo">liongo lionreact</a>
            </p>
          </div>
        </div>

      </div>

    );
  }
}
function mapStateToProps(state) {
  return state;
}

export default connect(mapStateToProps)(PnoteIndex);
