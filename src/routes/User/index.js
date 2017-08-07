import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import classNames from 'classnames';
import { Toast, Picker, Button } from 'antd-mobile';
import styles from './User.css';

function gradeStringToNumber(value) {
  let grade;
  switch (value) {
    case '一年级':
      grade = 1;
      break;
    case '二年级':
      grade = 2;
      break;
    case '三年级':
      grade = 3;
      break;
    case '四年级':
      grade = 4;
      break;
    case '五年级':
      grade = 5;
      break;
    case '六年级':
      grade = 6;
      break;
    case '七年级':
      grade = 7;
      break;
    case '八年级':
      grade = 8;
      break;
    case '九年级':
      grade = 9;
      break;
    default:
      grade = 1;
  }
  return grade;
}
function gradeNumberTotring(value) {
  let grade;
  switch (value) {
    case 1:
      grade = '一年级';
      break;
    case 2:
      grade = '二年级';
      break;
    case 3:
      grade = '三年级';
      break;
    case 4:
      grade = '四年级';
      break;
    case 5:
      grade = '五年级';
      break;
    case 6:
      grade = '六年级';
      break;
    case 7:
      grade = '七年级';
      break;
    case 8:
      grade = '八年级';
      break;
    case 9:
      grade = '九年级';
      break;
    default:
      grade = '一年级';
  }
  return grade;
}

class User extends React.Component {
  state = {
    sheng: [],
    shengName: '',
    schoolType: '',
    schoolId: '',
    gradeId: '',
    classId: '',
    name: '',
    schoolsValue: {
      v: [],
      n: '请选择学校',
    },
    gradeValue: {
      v: [],
      n: '请选择年级',
    },
    classValue: {
      v: [],
      n: '请选择班级',
    },
    code: '',
    totalFee: 1,
    backUrl: 'http://wx.class100.com/payinfo',
  };
  componentDidMount() {
    const { location } = this.props;
    const { pathname } = location;
    if (pathname === '/payinfo') {
      this.paySetInfo();
    }
  }
  componentWillUnmount() {
    if (this.getCodeTime) {
      clearTimeout(this.getCodeTime);
      this.getCodeTime = null;
    }
  }
  hasPay = () => {
    let err = false;
    const { dispatch, login, location: { query = {} } } = this.props;
    // -1 用户不存在 1 未支付 2已支付
    if (login.payFlag && login.payFlag === 1) {
      err = false;
    }
    if (login.payFlag && login.payFlag === 2) {
      dispatch(routerRedux.replace({
        pathname: '/bought',
        query: {
          ...query,
          outTradeNo: login.orderId,
        },
      }))
      err = true;
    }
    console.log(err, 1111)
    return err;
  }
  paySetInfo = () => {
    const { dispatch, location, login } = this.props;
    const { pathname, query = {} } = location;
    if (this.hasPay()) return;
    if (query.code) {
      this.setState({
        code: query.code,
      })
      if (query.state && query.state === 'region') {
        // if (window) {
        //   window.location.href = `/payinfo?token=${login.token}&code=${query.code}&region=region}`;
        // } else {
          dispatch(routerRedux.replace({
            pathname: '/payinfo',
            query: {
              code: query.code,
              region: 'region',
            },
          }));
        // }
        this.getOrderInfo(query.code);
      } else {
        this.getOrderInfo(query.code);
      }
    } else {
      this.getCode();
      console.log('没有code');
    }
  }
  getCode = () => {
    const { dispatch, location } = this.props;
    const { query = {} } = location;

    setTimeout(() => {
      dispatch({
        type: 'toast/showToast',
        err: {
          type: 'loading',
          content: '正在获取用户权限',
          duration: 6,
        },
      });
    }, 500);
    console.log('正在获取用户权限');
    let BACKURL = 'http://wx.class100.com/payinfo';
    if (window) {
      BACKURL = `${window.location.origin}/payinfo`;
      const backUrl = BACKURL || this.state.backUrl;
      const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx24a77e0007773243&redirect_uri=${backUrl}&response_type=code&scope=snsapi_base&state=${query.region}&connect_redirect=1&#wechat_redirect`;
      this.getCodeTime = setTimeout(() => {
        window.location.href = url;
      }, 2000);
    }
  }
  getOrderInfo = (newCode) => {
    const { dispatch, login } = this.props;
    const { code, totalFee } = this.state;
    dispatch({ type: 'order/getPayInfo',
      query: {
        appid: 'wx24a77e0007773243',
        code: newCode || code,
        Body: 'VIP美国名师口语直播课',  // 商品或支付单简要描述
        totalFee: totalFee,               // 订单总金额，单位为分，详见支付金额
        phone: login.phone - 0,
      } });
  }
  /**
   * 设置支付信息
   */
  handleSubPayInfo = () => {
    const that = this;
    const { dispatch, location, login } = this.props;
    const { pathname, query = {} } = location;
    const { gradeValue, name } = this.state;
    if (!gradeValue.n || !name) {
      dispatch({
        type: 'toast/showToast',
        err: {
          type: 'fail',
          content: '请填写完整用户信息！',
          duration: 1,
        },
      });
      return;
    }
    Toast.loading('正在加载中···', 0);
    dispatch({
      type: 'login/addStudent',
      query: {
        grade: gradeValue.v[0],
        name,
      },
      sheng: this.state.sheng,
      SchoolName: this.state.schoolsValue.n,
      WholeClassName: this.state.gradeValue.n + this.state.classValue.n,
      grade_id: this.state.gradeValue.v[0],
      callback(e) {
        if (e) { console.error(e); }
        Toast.hide();
        if (login.backURL === '/course') {
          dispatch(routerRedux.replace({
            pathname: '/course',
            query: {
              ...query,
              token: login.token,
            },
          }));
          return;
        }
        if (login.backURL === '/quizs') {
          dispatch(routerRedux.replace({
            pathname: '/quizs',
            query: {
              ...query,
              token: login.token,
            },
          }));
          return;
        }
        dispatch(routerRedux.replace({
          pathname: '/payinfo',
          query: {
            ...query,
            token: login.token,
          },
        }));
        console.log(2222)
        that.getCode();
      },
    });
  }
  handlePay = () => {
    const { dispatch, location } = this.props;
    const { query = {} } = location;
    if (!query.code) {
      dispatch({
        type: 'toast/showToast',
        err: {
          type: 'fail',
          content: '未获取code权限，请刷新重试或重新登录',
          duration: 5,
        },
      });
      return;
    };
    dispatch({
      type: 'order/pay',
      dispatch,
    });
  }
  getSchool = (schoolType = 1) => {
    const { dispatch, location } = this.props;
    const { pathname } = location;
    if (pathname === '/entering' && schoolType === 3) {
      Toast.loading('抱歉，你所在年级的测试还在紧急制作中', 3);
      return;
    }
    Toast.loading('正在加载学校信息···', 0);
    dispatch({
      type: 'school/getSchools',
      query: {
        province: this.state.sheng[0],
        city: this.state.sheng[1],
        regionName: this.state.sheng[2],
        schoolType: `${schoolType}`,
      },
      callback() {
        Toast.hide();
      },
    });
    this.setState({
      schoolType,
      schoolsValue: {
        v: [],
        n: '请选择学校',
      },
      gradeValue: {
        v: [],
        n: '请选择年级',
      },
      classValue: {
        v: [],
        n: '请选择班级',
      },
    });
  }
  setSchool = ({ id }) => {
    const { dispatch, school: { schools = [] } } = this.props;
    let newSchools = {};
    for (let i = 0; i < schools.length; i++) {
      if (schools[i].id === id[0]) {
        newSchools = schools[i];
        break;
      }
    }
    const grade = newSchools.grades.split(',');
    dispatch({
      type: 'school/setGrade',
      grade,
    });
    this.setState({
      schoolId: id[0],
      schoolsValue: {
        v: id,
        n: newSchools.schoolname,
      },
      gradeValue: {
        v: [],
        n: '请选择年级',
      },
      classValue: {
        v: [],
        n: '请选择班级',
      },
    });
  }
  setGrade = ({ id }) => {
    const { dispatch } = this.props;
    const { schoolId } = this.state;
    const gradeName = gradeNumberTotring(id[0]);
    this.setState({
      gradeValue: {
        v: id,
        n: gradeName,
      },
      classValue: {
        v: [],
        n: '请选择班级',
      },
    });
    dispatch({
      type: 'login/setGrade',
      grade: id[0],
    });
    dispatch({
      type: 'school/getClasses',
      query: {
        schoolId,
        gradeId: id[0],
      },
    });
  }
  getClasses = ({ schoolId, gradeId }) => {
    const { dispatch } = this.props;
    Toast.loading('正在加载班级信息···', 0);
    dispatch({
      type: 'school/getClasses',
      query: {
        schoolId,
        gradeId,
      },
      callback() {
        Toast.hide();
      },
    });
    this.setState({
      gradeId,
    });
  }
  setClasses = ({ id }) => {
    const { school } = this.props;
    const { classes = [] } = school;
    const item = classes.filter((item) => {
      return item.id === id[0];
    })[0] || {};
    this.setState({
      classId: id[0],
      classValue: {
        v: id,
        n: item.class_name,
      },
    });
  }
  /**
   * 设置用户信息
   */
  handleSubUInfo = () => {
    const { dispatch, location: { query } } = this.props;
    const { classId, name } = this.state;
    if (!classId || !name) {
      dispatch({
        type: 'toast/showToast',
        err: {
          type: 'fail',
          content: '请填写完整用户信息！',
          duration: 1,
        },
      });
      return;
    }
    dispatch({
      type: 'init/reTest',
      payload: {},
    });
    Toast.loading('正在加载中···', 0);
    dispatch({
      type: 'login/addStudent',
      query: {
        classId,
        name,
      },
      sheng: this.state.sheng,
      SchoolName: this.state.schoolsValue.n,
      WholeClassName: this.state.gradeValue.n + this.state.classValue.n,
      grade_id: this.state.gradeValue.v[0],
      callback(e) {
        if (e) { console.error(e); }
        dispatch(routerRedux.push({
          pathname: '/quizs',
          query,
        }));
        Toast.hide();
      },
    });
  }
  render() {
    const { dispatch, location, login } = this.props;
    const { pathname, query } = location;
    let PAGE = {};
    switch (pathname) {
      case '/entering':
        PAGE = {
          title: '我的信息',
          result: null,
          content: this.renderForm('填写正确的信息有助于匹配测试题哦', '信息确认后不能再修改'),
          toast: null,
          btns: (
            <div className={styles.clearfix}>
              <Button onClick={this.handleSubUInfo} className={styles.submitBtn} type="primary">立即测试</Button>
              <div className={styles.toLogin}>
                <span
                  className={styles.LoginLink}
                  onClick={() => {
                    const { dispatch } = this.props;
                    dispatch({
                      type: 'login/logout',
                    });
                  }}
                >
                  重新登录
                </span>
              </div>
            </div>
          ),
        };
        if (query.region === 'region') {
          let btn = '设置支付信息';
          if (login.backURL === '/course') {
            btn = '保存信息';
          }
          if (login.backURL === '/quizs') {
            btn = '立即测试';
          }
          PAGE = {
            title: '填写信息',
            result: null,
            content: this.renderForm(`绑定手机号：${login.phone}`),
            toast: null,
            btns: (
              <div className={styles.clearfix}>
                <Button onClick={this.handleSubPayInfo} className={styles.submitBtn} type="primary">{btn}</Button>
              </div>
            ),
          };
        }
        break;
      case '/user':
        PAGE = {
          title: '我的信息',
          result: null,
          content: this.renderInfo(login.user),
          toast: null,
          btns: (
            <div className={styles.clearfix}>
              <Button
                onClick={() => {
                  const { dispatch, location: { query } } = this.props;
                  dispatch({
                    type: 'init/reTest',
                    payload: {},
                  });
                  dispatch(routerRedux.push({
                    pathname: '/quizs',
                    query,
                  }));
                }} className={styles.submitBtn} type="primary"
              >立即测试</Button>
              <Button
                onClick={() => {
                  const { dispatch, location: { query } } = this.props;
                  dispatch(routerRedux.push({
                    pathname: '/history',
                    query,
                  }));
                }} className={styles.checkBtn} type="ghost"
              >查看测试记录</Button>
              <div className={styles.toLogin}>
                <span
                  className={styles.LoginLink}
                  onClick={() => {
                    const { dispatch } = this.props;
                    dispatch({
                      type: 'login/logout',
                    });
                  }}
                >
                  重新登录
                </span>
              </div>
            </div>
          ),
        };
        break;
      case '/setpay':
        PAGE = {
          title: '填写信息',
          result: null,
          content: this.renderForm(`绑定手机号：${login.phone}`),
          toast: null,
          btns: (
            <div className={styles.clearfix}>
              <Button onClick={this.handleSubPayInfo} className={styles.submitBtn} type="primary">立即支付</Button>
            </div>
          ),
        };
        break;
      case '/payinfo':
        PAGE = {
          title: '我的信息',
          result: null,
          content: this.renderInfo(login.user, 49),
          toast: this.renderToast(),
          btns: (
            <div className={styles.clearfix}>
              <Button onClick={this.handlePay} className={styles.submitBtn} type="primary">立即支付</Button>
            </div>
          ),
        };
        if (query.region === 'region') {
          PAGE = {
            title: '我的信息',
            result: null,
            content: this.renderInfo(login.user, 49, query.region),
            toast: this.renderToast(),
            btns: (
              <div className={styles.clearfix}>
                <Button onClick={this.handlePay} className={styles.submitBtn} type="primary">立即支付</Button>
              </div>
            ),
          };
        }
        break;
      case '/bought':
        PAGE = {
          title: '我的信息',
          result: this.renderResult(),
          content: this.renderInfo(login.user),
          toast: null,
          btns: null,
        };
        break;
      default:
        PAGE = {
          title: '我的信息',
          result: this.renderResult(),
          content: this.renderInfo(),
          formTitle: '填写正确的信息有助于匹配测试题哦',
          minTitle: '信息确认后不能再修改',
          toast: this.renderToast(),
          btns: (
            <div className={styles.clearfix}>
              <Button onClick={this.handleSubmit} className={styles.submitBtn} type="primary">立即测试</Button>
              <Button onClick={this.handleSubmit} className={styles.checkBtn} type="ghost">查看测试记录</Button>
            </div>
          ),
        };
        break;
    }

    return (
      <div className={styles.LoginPage}>
        <div className={styles.resultBox}>
          {PAGE.result}
        </div>
        <h1 className={styles.title}>{PAGE.title}</h1>
        <div className={styles.loginBox}>
          <div className={styles.content}>
            {PAGE.content}
          </div>
        </div>
        <div className={styles.clearfix}>
          {PAGE.toast}
        </div>
        {PAGE.btns}
      </div>
    );
  }
  renderResult = () => {
    const { dispatch } = this.props;
    return (
      <div className={styles.resultWrap}>
        <div className={styles.resultIcon} />
        <p className={styles.resultInfo}>您的账户已购买过该课程啦~</p>
        <div className={classNames(styles.resultBtns, styles.clearfix)}>
          <Button
            onClick={() => {
              const { dispatch, location: { query } } = this.props;
              dispatch(routerRedux.push({
                pathname: '/orderinfo',
                query,
              }));
            }} className={classNames(styles.submitBtn, styles.l)} type="primary"
          >查看我的订单</Button>
          {/* <Button*/}
          {/* onClick={() => dispatch(routerRedux.push({*/}
          {/* pathname: '/login',*/}
          {/* }))} className={classNames(styles.submitBtn, styles.l)} type="primary"*/}
          {/* >帮朋友购买</Button>*/}
        </div>
      </div>
    );
  }
  renderToast = () => {
    return (
      <div className={styles.toastWrap}>
        <p className={styles.toastItem}>请确认以上信息正确无误，</p>
        <p className={styles.toastItem}>正确请点击立即支付，不正确请<span
          className={styles.LoginLink} onClick={() => {
            const { dispatch } = this.props;
            dispatch({
              type: 'login/logout',
            });
          }}
        >重新登录</span></p>
      </div>
    );
  }
  renderForm = (formTitle, minTitle) => {
    const {
      schoolType,
      name,
      sheng,
      schoolsValue = {},
      gradeValue = {},
      classValue = {},
    } = this.state;
    const { school, location } = this.props;
    const { query } = location;
    const { schools = [], grade = [], classes = [], province = [] } = school;
    const schoolsList = schools.map(({ id, schoolname, grades = [] }) => {
      return {
        value: id,
        label: schoolname,
      };
    });
    let gradeList = grade.filter((item) => {
      if (
        item === '四年级' ||
        item === '五年级' ||
        item === '六年级' ||
        item === '七年级'
      ) {
        return item;
      }
      return false;
      // return item;
    }).map((item) => {
      return {
        value: gradeStringToNumber(item),
        label: item,
      };
    });
    if (query.region === 'region') {
      gradeList = [
        {
          value: 4,
          label: '四年级',
        },
        {
          value: 5,
          label: '五年级',
        },
        {
          value: 6,
          label: '六年级',
        },
        {
          value: 7,
          label: '七年级',
        },
      ];
    }
    const classesList = classes.map(({ id, class_name }) => {
      return {
        value: id,
        label: class_name,
      };
    });
    return (
      <div className="">
        {
          formTitle ? <p className={styles.info}>{formTitle}</p> : null
        }
        {
          minTitle ? <p className={styles.infoMin}>{minTitle}</p> : null
        }
        <div className={styles.from}>
          { query.region === 'region' ? null : (
            <div className={styles.item}>
              <label className={styles.label}>地区：</label>
              <div className={styles.clearfix}>
                <Picker
                  data={province}
                  title="选择地区"
                  value={this.state.sheng || []}
                  cols="3"
                  onChange={(v) => {
                    this.setState({
                      sheng: v,
                      schoolType: '',
                      schoolsValue: {
                        v: [],
                        n: '请选择学校',
                      },
                      gradeValue: {
                        v: [],
                        n: '请选择学校',
                      },
                      classValue: {
                        v: [],
                        n: '请选择班级',
                      },
                    });
                  }}
                >
                  <div className={styles.iptWrap}>
                    <div className={styles.ellipsis}>
                      {
                        sheng.length ? sheng.join('') : '选择地区请选择'
                      }
                    </div>
                  </div>
                </Picker>
              </div>
            </div>
          )}
          { query.region === 'region' ? null : (
            <div className={styles.item}>
              <label className={styles.label}>在读：</label>
              <div className={classNames(styles.iptWrap, styles.radioWrap, styles.clearfix)}>
                <label onClick={e => this.getSchool(1)}className={styles.radio}><div className={styles.ellipsis}>
                  <i className={classNames(styles.checkedIcon, schoolType === 1 ? styles.checked : null)} />小学</div>
                  <input id="radio-1" value="1" name="t" type="radio" />
                </label>
                <label onClick={e => this.getSchool(2)} className={styles.radio}><div className={styles.ellipsis}>
                  <i className={classNames(styles.checkedIcon, schoolType === 2 ? styles.checked : null)} />初中</div>
                  <input id="radio-2" value="2" name="t" type="radio" />
                </label>
                <label onClick={e => this.getSchool(3)} className={styles.radio}><div className={styles.ellipsis}>
                  <i className={classNames(styles.checkedIcon, schoolType === 3 ? styles.checked : null)} />高中</div>
                  <input id="radio-3" value="3" name="t" type="radio" />
                </label>
              </div>
            </div>
          )}
          { query.region === 'region' ? null : (
            <div className={styles.item}>
              <label className={styles.label}>学校：</label>
              <div>
                <Picker
                  data={schoolsList}
                  title="选择学校"
                  value={schoolsValue.v || []}
                  cols="1"
                  onChange={v => this.setSchool({ id: v })}
                >
                  <div className={styles.iptWrap}>
                    <div className={styles.ellipsis}>{ schoolsValue.n || '请选择学校' }</div>
                  </div>
                </Picker>
              </div>
            </div>
          )}
          <div className={styles.item}>
            <label className={styles.label}>年级：</label>
            <div className={classNames(styles.clearfix)}>
              <Picker
                data={gradeList}
                title="选择年级"
                value={gradeValue.v || []}
                cols="1"
                onChange={v => this.setGrade({ id: v })}
              >
                <div className={classNames(styles.iptWrap)}>
                  <div className={styles.ellipsis}>{ gradeValue.n || '请选择年级' }</div>
                </div>
              </Picker>
            </div>
          </div>
          { query.region === 'region' ? null : (
            <div className={styles.item}>
              <label className={styles.label}>班级：</label>
              <div className={classNames(styles.clearfix)}>
                <Picker
                  data={classesList}
                  title="选择班级"
                  cols="1"
                  value={classValue.v || []}
                  onChange={v => this.setClasses({ id: v })}
                >
                  <div className={classNames(styles.iptWrap)}>
                    <div className={styles.ellipsis}>{classValue.n || '请选择班级'}</div>
                  </div>
                </Picker>
              </div>
            </div>
          )}
          <div className={styles.item}>
            <label className={styles.label}>姓名：</label>
            <div className={styles.clearfix}>
              <div className={classNames(styles.iptWrap, styles.noSj)}>
                <input placeholder="请输入姓名" onChange={e => this.setState({ name: e.target.value })} value={name} className={styles.iptName} type="text" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  renderInfo = (user = {}, money = 0, region) => {
    if (region === 'region') {

    }
    return (
      <div className={styles.InfoWrap}>
        <div className={styles.clearfix}>
          <h3 className={styles.InfoTitle}>学校：</h3>
          <p className={styles.InfoContent}>{user.SchoolName}</p>
        </div>
        <div className={styles.clearfix}>
          <h3 className={styles.InfoTitle}>班级：</h3>
          <p className={styles.InfoContent}>{user.WholeClassName}</p>
        </div>
        <div className={styles.clearfix}>
          <h3 className={styles.InfoTitle}>手机号：</h3>
          <p className={styles.InfoContent}>{user.phone}</p>
        </div>
        {
          money ? (
            <div className={styles.clearfix}>
              <h3 className={styles.InfoTitle}>课程费用：</h3>
              <p className={classNames(styles.InfoContent, styles.Red)}>￥<strong>{money}</strong></p>
            </div>
          ) : null
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return state;
}

export default connect(mapStateToProps)(User);
