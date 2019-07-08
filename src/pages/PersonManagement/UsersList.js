import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Modal,
  Carousel, message,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './PersonMList.less';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

@Form.create()
class UpdateModal extends PureComponent {


  onCancel = () => {
    const { updateOnCancel, form } = this.props;
    form.resetFields();

    this.setState(
      () => {
        updateOnCancel();
      },
    )
    ;
  };

  render() {

    const { form, modalVisible, selectedRow, selectedRows, DeptData } = this.props;
    const onOk = () => {
      const { form: { validateFields }, updateOnOk, selectedRows } = this.props;
      validateFields((err, fieldsValue) => {
        let levelnames = fieldsValue.level;
        let code = '';
        if (fieldsValue.level === 1) {
          levelnames = DeptData.filter(item => item.deptcode === (DeptData.filter(item1 => item1.deptcode === selectedRows[0].deptcode)[0].parentdeptcode))[0].deptname;
          code = DeptData.filter(item1 => item1.deptcode === selectedRows[0].deptcode)[0].parentdeptcode;
        } else if (fieldsValue.level === 2) {
          levelnames = DeptData.filter(item => item.deptcode === selectedRows[0].deptcode)[0].deptname;
          code = selectedRows[0].deptcode;
        } else if (fieldsValue.level === 0) {
          levelnames = '全部';
        } else {
          levelnames = '个人';
        }
        const temp = {
          ...fieldsValue,
          userid: selectedRows[0].userid,
          leveldeptcode: code,
          deptcode: selectedRows[0].deptcode,
          telphone: selectedRows[0].telphone,
          levelname: levelnames,
        };

        if (err) return;
        this.setState(
          () => {
            updateOnOk(temp);
          },
        );
      });

    };

    return (
      <Modal
        title={'权限配置'}
        visible={modalVisible}
        onOk={onOk}
        onCancel={this.onCancel}
      >
        <Form layout="inline" className={styles.searchForm}>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={23} sm={24}>
              <FormItem label={'员工编号'}>
                {form.getFieldDecorator('employeeNumber', {
                  initialValue: selectedRows[0].webchart,
                })(<Input disabled/>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={23} sm={24}>
              <FormItem label={'员工姓名'}>
                {form.getFieldDecorator('username', {
                  initialValue: selectedRows[0].username,
                })(<Input disabled/>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={23} sm={24}>
              <FormItem label={'员工职位'}>
                {form.getFieldDecorator('usertype', {
                  initialValue: selectedRows[0].usertype,
                })(<Input disabled/>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={23} sm={24}>
              <FormItem label={'部门名称'}>
                {form.getFieldDecorator('dept', {
                  initialValue: selectedRows[0].deptcode !== null ? DeptData.filter(item => item.deptcode === selectedRows[0].deptcode)[0].deptname : '',
                })(<Input disabled/>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={23} sm={24}>
              <FormItem label={'员工权限'}>
                {form.getFieldDecorator('level', {
                  initialValue: 3,
                  rules: [{ required: true, message: '请选择员工权限' }],
                })(<Select
                  placeholder="请选择">
                  <Select.Option value={0}>全部</Select.Option>
                  <Select.Option
                    value={1}>{selectedRows[0].deptcode !== null ? DeptData.filter(item => item.deptcode === (DeptData.filter(item1 => item1.deptcode === selectedRows[0].deptcode)[0].parentdeptcode))[0].deptname : ''}</Select.Option>
                  <Select.Option
                    value={2}>{selectedRows[0].deptcode !== null ? DeptData.filter(item => item.deptcode === selectedRows[0].deptcode)[0].deptname : ''}</Select.Option>
                  <Select.Option value={3}>个人</Select.Option>
                </Select>)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={23} sm={24}>
              <FormItem label={'备注'}>
                {form.getFieldDecorator('remarks', {})(<TextArea  placeholder="请输入备注！最多100字" autosize={{ minRows: 2, maxRows: 4 }} maxLength="100"/>)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ UsersInfo, PersonInfo, loading }) => ({
  UsersInfo,
  PersonInfo,
  loading: loading.models.UsersInfo,
}))
@Form.create()
class InfoInputList extends PureComponent {
  state = {
    selectedRows: [],
    selectedRow: {},
    formValues: {},
    fileUrls: [],
    statisticsVisible: false,
    statisticalVisible: false,
    modalVisible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'UsersInfo/fetch',
    });
    dispatch({
      type: 'UsersInfo/fetchDeptData',
    });
    dispatch({
      type: 'PersonInfo/fetch',
    });
  }

  /*重置*/
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'UsersInfo/fetch',
      payload: {},
    });
  };
  /*添加*/
  handleAdd = fields => {
    const { dispatch } = this.props;
    const self = this;
    new Promise((resolve, reject) => {
      dispatch({
        type: 'businessList/add',
        payload: {
          ...fields,
          resolve,
          reject,
        },

      });
    }).then((sta) => {
      if (sta !== null) {
        self.handleFormReset();
        message.success('添加成功！');
        self.handleModalVisible();
        self.setState({
          selectRows: [],
        });
      }
    });


    // dispatch({
    //   type: 'businessList/add',
    //   payload: {
    //     ...fields,
    //   },
    // });
    //
    // message.success('添加成功');
    // this.handleModalVisible();
    // this.setState({ selectedRows: [] });
    // this.handleFormReset();
  };
  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
      selectedRow: rows[0],
    });
  };
  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      let pidR = undefined;
      if (fieldsValue.webchart !== '' && fieldsValue.webchart !== undefined) {
        pidR = ('000000000' + fieldsValue.webchart).slice(-9);
      }
      const values = {
        webchart: pidR,
        username: fieldsValue.username !== '' ? fieldsValue.username : '',
      };
      this.setState({
        formValues: values,
      });
      dispatch({
        type: 'UsersInfo/fetch',
        payload: values,
      });
    });
  };

  refundModal = () => {
    this.setState({
      modalVisible: true,
    });
  };
  /*配置成功*/
  updateOnOk = (fields) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'PersonInfo/add',
      payload: {
        ...fields,
      },
    });
    message.success('操作成功');
    this.setState({
      modalVisible: false,
    });
    this.setState({ selectedRows: [] });
    // this.handleFormReset();
  };
  updateOnCancel = () => {
    const { modalVisible } = this.state;
    this.setState({
      modalVisible: false,
    });
  };

  // 查询
  renderAdvancedForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form onSubmit={this.handleSearch} layout="inline" className={styles.searchForm}>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="员工编号">
              {getFieldDecorator('webchart')(<Input placeholder="请输入"/>)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="员工姓名">
              {getFieldDecorator('username')(
                <Input placeholder="请输入"/>,
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
          </div>
        </div>
      </Form>
    );
  }

  handleOk = () => {
    this.setState({
      statisticsVisible: false,
      statisticalVisible: false,
    });
  };

  handleCancel = () => {
    this.setState({
      statisticsVisible: false,
      statisticalVisible: false,
    });
  };

  render() {
    const {
      UsersInfo: { UserDatas, DeptData },
      PersonInfo: { PersonData },
      form: { getFieldDecorator },
      loading,
    } = this.props;
    console.log(PersonData,'PersonData')
    const columns = [
      {
        title: '员工编号',
        dataIndex: 'webchart',
        align: 'center',
      },
      {
        title: '员工姓名',
        dataIndex: 'username',
        align: 'center',
      },
      {
        title: '员工职位',
        dataIndex: 'usertype',
        align: 'center',
      },
      {
        title: '联系电话',
        dataIndex: 'telphone',
        align: 'center',
      },
      {
        title: '部门名称',
        dataIndex: 'deptcode',
        align: 'center',
        render: (text) => {
          if (DeptData !== undefined) {
            const deptName = DeptData.filter(item => item.deptcode === text);
            return deptName.length > 0 ? deptName[0].deptname : text;
          }
          return text;

        },
      },
    ];
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };
    const updateMethods = {
      updateOnOk: this.updateOnOk,
      updateOnCancel: this.updateOnCancel,
      irreversibleAmountOnchack: this.irreversibleAmountOnchack,
    };
    let aa = false;
    if (selectedRows.length === 1) {
      if (PersonData !== undefined) {
        if (PersonData.list.length > 0) {
          aa = PersonData.list.filter(item => item.employeeNumber === selectedRows[0].webchart).length > 0;
        }
      }
    } else {
      aa = true;
    }
    const { selectedRows, selectedRow, modalVisible } = this.state;

    return (
      <PageHeaderWrapper title="人员管理">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>
            <div className={styles.tableListOperator}>
              <Button type="primary"
                      disabled={aa}
                      onClick={this.refundModal}>
                权限配置
              </Button>
            </div>
            <StandardTable
              rowKey="userid"
              selectedRows={selectedRows}
              loading={loading}
              data={UserDatas}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        {selectedRows && selectedRows.length != 0 ? (
          <UpdateModal
            {...updateMethods}
            modalVisible={modalVisible}
            selectedRow={selectedRow}
            selectedRows={selectedRows}
            DeptData={DeptData}
          />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default InfoInputList;
