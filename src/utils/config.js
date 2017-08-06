import GetQueryString from './getQuery';

const isRegion = GetQueryString('region');

let apiURL = '/proxy/v1';
switch (__ENV__) {
  case 'production':
    apiURL = '//domain.com/v1';
    break;
  case 'develop':
    // apiURL = '/proxy/v1';
    apiURL = '//domain.com/v1';
    break;
  default:
    apiURL = '/proxy/v1';
    break;
}
export default {
  apiURL,
  isRegion,
};
