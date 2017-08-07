import { apiURL } from '../utils/config';
import request from '../utils/request';

export async function loginhook() {
  return request(`${apiURL}/api`);
}

/**
 * 发送手机验证码
 * @param data { "phone":"17602887186" }
 * @returns {Promise.<Object>}
 */
export async function sendCode(data) {
  return request(`${apiURL}/sendIdentifyCode`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * 验证手机验证码
 * @param data { "phone":"17602887186", "identifyCode":9561 }
 * @returns {Promise.<Object>}
 */
export async function login(data) {
  return request(`${apiURL}/verifyIdentifyCode`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * 更新密码
 * @param data { "phone":"17602887186", "identifyCode":9561 }
 * @returns {Promise.<Object>}
 */
export async function resetPwd({ query, token }) {
  return request(`${apiURL}/updatePasswd`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-access-token': `Bearer ${token}`,
    },
    body: JSON.stringify(query),
  });
}
// 查询学生信息
export async function user({ query, token }) {
  return request(`${apiURL}/queryStudentInfo`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-access-token': `Bearer ${token}`,
    },
    body: JSON.stringify(query),
  });
}
