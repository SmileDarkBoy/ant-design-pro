import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { Checkbox, Alert, Icon,message } from 'antd';
import Login from '@/components/Login';
import styles from './Login.less';

const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
class LoginPage extends Component {
  state = {
    type: 'account',
    autoLogin: true,
  };

  onTabChange = type => {
    this.setState({ type });
  };

  onGetCaptcha = () =>
    new Promise((resolve, reject) => {
      this.loginForm.validateFields(['mobile'], {}, (err, values) => {
        if (err) {
          reject(err);
        } else {
          const { dispatch } = this.props;
          dispatch({
            type: 'login/getCaptcha',
            payload: values.mobile,
          })
            .then(resolve)
            .catch(reject);
        }
      });
    });

  handleSubmit = (err, values) => {
    if (!err) {
      const { type } = this.state;
      const { dispatch } = this.props;
      /*if (values.userName!=="admin"||values.password!=="system"){
        message.error('用户名或者密码错误！');
      }*/
      dispatch({
        type: 'login/login',
        payload: {
          userCode:values.userName,
          password:values.password,
          type,
        },
      });
    }
  };

  renderMessage = content => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon/>
  );

  render() {
    const { login, submitting } = this.props;
    const { type } = this.state;
    return (
      <div className={styles.main}>
        <Login
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          ref={form => {
            this.loginForm = form;
          }}>
          <Tab key="account" tab={'登录'}>
            {login.status === 'error' && login.type === 'account' && !submitting &&
            this.renderMessage(formatMessage({ id: 'app.login.message-invalid-credentials' }))}
            <UserName name="userName" placeholder="用户名 admin"/>
            <Password name="password" placeholder="密码 888888" onPressEnter={() => this.loginForm.validateFields(this.handleSubmit)}/>
          </Tab>
          <Submit loading={submitting}>
            <FormattedMessage id="app.login.login"/>
          </Submit>
        </Login>
      </div>
    );
  }
}

export default LoginPage;
