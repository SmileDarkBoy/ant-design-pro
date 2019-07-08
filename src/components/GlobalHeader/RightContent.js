import React, { PureComponent } from 'react';
import { Tag, Menu, Icon, Dropdown, Form, Modal, Input, Row, Col, Select, message } from 'antd';
import moment from 'moment';
import groupBy from 'lodash/groupBy';
import styles from './index.less';
import router from 'umi/router';
import { connect } from 'dva';

@connect(({ infoRule, loading }) => ({
  infoRule,
  loading: loading.models.infoRule,
}))
export default class GlobalHeaderRight extends PureComponent {
  state = {
    safetyVisiable: false,
  }

  handleSafety = flag => {
    this.setState({
      safetyVisiable: !!flag,
    });
  }
  saveSafety = fields => {

    const {dispatch} = this.props;

    console.log("修改密码");
    new Promise((resolve, reject) => {
      dispatch({
        type:'infoRule/updatePassword',
        payload: {
          ...fields,
          resolve,
          reject
        }
      })
    }).then(sta => {
      if(sta){
        message.success('保存成功')
        this.handleSafety();
      }else{
        message.error('保存失败')
      }
    })
  };

  getNoticeData() {
    const { notices = [] } = this.props;
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map(notice => {
      const newNotice = { ...notice };
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime).fromNow();
      }
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = {
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        }[newNotice.status];
        newNotice.extra = (
          <Tag color={color} style={{ marginRight: 0 }}>
            {newNotice.extra}
          </Tag>
        );
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  }
  handleMenuClick = ({ key }) => {
    const { dispatch } = this.props;
    if (key === 'userCenter') {
      router.push('/account/center');
      return;
    }
    if (key === 'triggerError') {
      router.push('/exception/trigger');
      return;
    }
    if (key === 'userinfo') {
      router.push('/account/settings/base');
      return;
    }
    if (key === 'logout') {
      dispatch({
        type: 'login/logout',
      });
    }
    if(key === 'safety'){
      this.handleSafety(true)
    }
  };

  render() {
    let { theme } = this.props;
    const { safetyVisiable } = this.state;
    const menu = (
      <Menu selectedKeys={[]} onClick={this.handleMenuClick}>
        <Menu.Divider />
        <Menu.Item key="safety">
          <Icon type="safety" />修改密码
        </Menu.Item>
        <Menu.Item key="logout">
          <Icon type="logout" />退出登录
        </Menu.Item>
      </Menu>
    );
    let className = styles.right;
    if (theme === 'dark') {
      className = `${styles.right}  ${styles.dark}`;
    }
    const safetyProps = {
      visible: safetyVisiable,
      handleVisible: this.handleSafety,
      saveSafety: this.saveSafety
    };
    return (
      <div className={className}>
        <Dropdown overlay={menu}>
            <span className={`${styles.action} ${styles.account}`} style={{'width':'111px','textAlign':'center'}}>
              <Icon type="menu" />快捷菜单
            </span>
        </Dropdown>
        <Safety {...safetyProps}/>
        {/*{currentUser.name ? (
          <Dropdown overlay={menu}>
            <span className={`${styles.action} ${styles.account}`}>
              <Avatar size="small" className={styles.avatar} src={currentUser.avatar} alt="avatar"/>
              <span className={styles.name}>{currentUser.name}</span>
            </span>
          </Dropdown>
        ) : (
          <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
        )}*/}
        {/*<SelectLang className={styles.action} />*/}
      </div>
    );
  }
}

const Safety = Form.create()(props => {
  const { form, visible, handleVisible,saveSafety } = props;
  const getFieldDecorator = form.getFieldDecorator;

  const okHandle = () => {
    form.validateFields((err, fields) => {
      if (err) return;
      form.resetFields();
      saveSafety(fields);
    });
  };

  const check = (rule, value, callback) => {
    const npw = form.getFieldValue('npw')
    if(value !== npw){
      callback('两次密码不一致，请重新输入');
    }
    callback();
  }

  return (
    <Modal
      destroyOnClose
      centered={true}
      maskClosable={false}
      title="修改密码"
      visible={visible}
      onOk={okHandle}
      onCancel={() => handleVisible()}
      width={500}
    >
      <form>
        <Row>
          <Col span={25}>
            <Form.Item labelCol={{ span: 6}} wrapperCol={{ span: 16 }} label="原密码">
              {getFieldDecorator('oldPassword', {
                rules:[{ required: true, whitespace: true, message: '原密码不能为空'}]
              })(<Input />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={25}>
            <Form.Item labelCol={{ span: 6}} wrapperCol={{ span: 16 }} label="新密码">
              {getFieldDecorator('npw', {
                rules:[{ required: true, whitespace: true, message: '新密码不能为空'}]
              })(<Input.Password />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={25}>
            <Form.Item labelCol={{ span: 6}} wrapperCol={{ span: 16 }} label="重复新密码">
              {getFieldDecorator('password', {
                validateFirst: true,
                validate: [
                  {trigger: ['onChange','onBlur'], rules: [
                      { required: true, whitespace: true, message: '不能为空'},
                      { validator: check }
                    ]}
                ]
                // rules:[{ required: true, whitespace: true, message: '不能为空'}]
              })(<Input.Password />)}
            </Form.Item>
          </Col>
        </Row>
      </form>
    </Modal>
  );
});

