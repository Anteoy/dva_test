import fetch from 'dva/fetch';
// 临时写法
let token = ''; // eslint-disable-line
if (window) { // eslint-disable-line
  try {
  if (localStorage.getItem('reduxPersist:login')) { // eslint-disable-line
    token = JSON.parse(localStorage.getItem('reduxPersist:login')).token; // eslint-disable-line
  }
  } catch (e) {
    console.log(e);
  }
}
function parseJSON(response) {
  return response.json();
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options = {}) {
  const { headers = {} } = options;
  const opt = {
    ...options,
    headers: {
      // 'x-access-token': `Bearer ${token}`,
      ...headers,
    },
  };
  return fetch(url, opt)
    .then(checkStatus)
    .then(parseJSON)
    .then(data => ({ data }))
    .catch(err => ({ err }));
}
