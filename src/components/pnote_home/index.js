import React from 'react';
import { connect } from 'dva';
import { Toast, Button } from 'antd-mobile';

class PnoteHome extends React.Component {
  state = {
    username: '',
    passwd: '',
  };
  render() {
    return (
      <div>
        <h1>SUCCESS!!!</h1>
      </div>

    );
  }
}
function mapStateToProps(state) {
  return state;
}

export default connect(mapStateToProps)(PnoteHome);
