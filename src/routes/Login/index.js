import React from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import { Toast, Button } from 'antd-mobile';
import styles from './LoginPage.css';

class LoginPage extends React.Component {
  state = {
    hasSet: false,
    time: 60,
    phone: '',
    pwd: '',
    phoneErr: false,
    pwdErr: false,
    visible: false,
  };
  componentWillUnmount() {
    if (this.setInter) {
      clearInterval(this.setInter);
    }
  }
  handleSet = () => {
    const { hasSet, phoneErr, phone } = this.state;
    const { dispatch } = this.props;
    let err = null;
    if (!phone && !err) {
      err = {
        type: 'info',
        content: '请先填写手机信息',
      };
    }
    if (phoneErr && !err) {
      err = {
        type: 'info',
        content: '请先填写正确的手机号码',
      };
    }
    if (err) {
      dispatch({
        type: 'toast/showToast',
        err: {
          ...err,
          duration: 1,
        },
      });
      return;
    }
    if (this.setInter) {
      clearInterval(this.setInter);
    }
    this.setState({
      hasSet: true,
      time: 59,
    });
    this.time();
    dispatch({ type: 'login/sendCode', phone });
  }
  time = () => {
    this.setInter = setInterval(() => {
      let time = this.state.time;
      let hasSet = true;
      time--;
      if (time === 0) {
        clearInterval(this.setInter);
        this.setInter = null;
        hasSet = false;
        time = 60;
      }
      this.setState({
        hasSet,
        time,
      });
    }, 1000);
  }
  handleSubmit = () => {
    const { phone, pwd } = this.state;
    const { dispatch, location } = this.props;
    let err = null;
    if (!phone && !err) {
      err = {
        content: '请输入手机号',
      };
    }
    if (!pwd && !err) {
      err = {
        content: '请输入验证码',
      };
    }
    if (err) {
      dispatch({
        type: 'toast/showToast',
        err: {
          type: 'fail',
          content: err.content || '请填写完整信息',
          duration: 1,
        },
      });
      return;
    }

    Toast.loading('正在登录中···', 0);
    dispatch({
      type: 'login/login',
      query: {
        phone,
        identifyCode: pwd - 0,
      },
      _pathname: location.pathname,
      callback() {
        Toast.hide();
      },
    });
  }
  phoneChagne = (e) => {
    const v = e.target.value;
    this.setState({
      phone: v,
      phoneErr: v ? !(/^1(3|4|5|7|8)\d{9}$/.test(v)) : false,
    });
  }
  pwdChagne = (e) => {
    const v = e.target.value;
    this.setState({
      pwd: v,
    });
  }
  onClose = key => () => {
    this.setState({
      [key]: false,
    });
  }
  render() {
    const { phone, pwd, hasSet, phoneErr, pwdErr, visible } = this.state;
    const { login } = this.props;
    const { ERROR } = login;
    return (
      <div className={styles.LoginWrap}>
        <div className={styles.loginFWrap}>
          <h2 className={styles.title}>登录</h2>
          <div className={styles.loginFrom}>
            <div className={styles.item}>
              <div className={styles.iptWrap}>
                <span className={classNames(styles.icon)} />
                <div className={styles.iptContent}>
                  <input value={phone} onChange={this.phoneChagne} placeholder="请输入手机号" className={styles.ipt} type="text" />
                </div>
                {
                  phoneErr ? (
                    <p className={styles.errInfo}>手机号格式不正确</p>
                  ) : null
                }
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.iptWrap}>
                <span className={classNames(styles.icon, styles.pwdIcon)} />
                <div className={classNames(styles.iptContent, styles.iptBtn)}>
                  <input value={pwd} onChange={this.pwdChagne} placeholder="请输入验证码" className={styles.ipt} type="text" />
                  <Button
                    onClick={() => !hasSet ? this.handleSet() : null}
                    className={classNames(styles.dxBtn, hasSet ? styles.on : null)}
                    type="primary" inline size="small"
                  >
                    {
                      hasSet ? (
                        `重新获取(${this.state.time}s)`
                      ) : (
                        '发送验证码'
                      )
                    }
                  </Button>
                </div>
                {/*{*/}
                  {/*login.pwd ? (*/}
                    {/*<p className={styles.errInfo}>验证码不正确</p>*/}
                  {/*) : null*/}
                {/*}*/}
              </div>
            </div>
            <Button onClick={this.handleSubmit} className={classNames(styles.submitBtn)} type="primary">登录</Button>
          </div>
        </div>
        <div className={styles.versionWrap}>
          <span>version: </span><strong>{__VERSION__ || '0.0.0'}</strong>
        </div>
        <ModalHX
          visible={visible}
          onOk={() => this.setState({ visible: false })}
          onCancel={() => this.setState({ visible: false })}
        />
      </div>
    );
  }
}

class ModalHX extends React.Component {
  state = {
    visible: this.props.visible,
  }
  componentDidMount() {
    this.handleOvf(this.props.visible);
  }
  componentWillReceiveProps(nextProps) {
    const { visible = false } = nextProps;
    this.setState({
      visible,
    });
    this.handleOvf(visible);
  }
  handleOvf = (has = false) => {
    if (window) {
      if (has) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style = '';
      }
    }
  }
  handleOk = () => {
    const { visible, onOk } = this.props;
    onOk && onOk();
    // this.setState({
    //   visible: false,
    // });
    this.handleOvf(false);
  }
  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel && onCancel();
    // this.setState({
    //   visible: false,
    // });
    this.handleOvf(false);
  }
  render() {
    const { visible } = this.state;
    return (
        visible ? (
          <div className={styles.modalWrap}>
            <div className={styles.modalBox}>
              <div onClick={this.handleCancel} className={styles.modalBG} />
              <div className={styles.modalContent}>
                <i onClick={this.handleCancel} className={styles.modalClose} />
                <i className={styles.modalIcon} />
                <div className={styles.modalInfo}>
                  <p className={styles.modalP}>抱歉，你的学号</p>
                  <p className={styles.modalP}>不在此次测试名单中</p>
                </div>
              </div>
            </div>
          </div>
        ) : null
    );
  }
}
function mapStateToProps(state) {
  return state;
}

export default connect(mapStateToProps)(LoginPage);
