import React from 'react';
import { connect } from 'dva';
import { Toast, Button } from 'antd-mobile';
import styles from './pnote_home.css';

class PnoteHome extends React.Component {
  state = {
    username: '',
    passwd: '',
  };
  render() {
    return (
      <div>
        <div className={styles.topNav}>
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
        <div id="interval"></div>
        <div className={styles.main}>
          <div className={styles.maininner}>
            <button >newPNote</button>
            <div id="tag-index">

              <h1>2017</h1>

              <h2>March</h2>

              <p><a href="javascript:void(0)" >Rong 360 运营商接口RC 0.1.0</a></p>


            <h2>January</h2>

            <p><a href="javascript:void(0)" >测试1</a></p>

          <p><a href="javascript:void(0)" >DSAFF</a></p>

        <p><a href="javascript:void(0)" >DSAFF</a></p>

    <p><a href="javascript:void(0)" >DSAFF</a></p>

    <p><a href="javascript:void(0)" >DSAFF</a></p>

    <p><a href="javascript:void(0)" >测试1</a></p>

    <p><a href="javascript:void(0)" >测试1</a></p>

    <p><a href="javascript:void(0)" >DSAFF</a></p>

    <p><a href="javascript:void(0)" >test2</a></p>

    <h1>1</h1>

    <h2>January</h2>

    <p><a href="javascript:void(0)" >Rong 360 运营商接口RC 0.1.0</a></p>

  </div>
  </div>
  </div>

    <div id="footer">
      <div id="footer-inner" className={styles.footerinner}>
        <p id="copyright">Copyright (c) 2016 - 2017 owner of copyright &nbsp;
          Powered by <a href="https://github.com/Anteoy/liongo">liongo</a> <a href="https://github.com/Anteoy/lionreact">lionreact</a>
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

export default connect(mapStateToProps)(PnoteHome);
