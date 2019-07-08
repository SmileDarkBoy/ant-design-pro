import React, { PureComponent, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import {
  Form,
  Card,
  Input,
  Row,
  Col,
  Select,
  Button,
  Modal,
  Tooltip,
  Icon,
  message,
} from 'antd';
import styles from './PersonMList.less';
import { connect } from 'dva';


const { TextArea } = Input;
const FormItem = Form.Item;
const { Option } = Select;
const confirms = Modal.confirm;
const states = ['', '正常', '停用'];
const levels = ['', '管理员', '个人'];
const levelss = ['全部', '东区', '南区', '西区', '北区'];

/*修改分类内容*/
@Form.create()
class UpdateModal extends PureComponent {


  onCancel = () => {
    const { updataModalonCancel } = this.props;

    this.setState(
      () => {
        updataModalonCancel();
      },
    );
  };

  render() {
    const { form: { getFieldDecorator,getFieldValue  }, NoteModalVisable, values,} = this.props;
    const onOk = () => {
      const { form: { validateFields }, handleUpdate } = this.props;


      validateFields((err, fieldsValue) => {
        const temp = {
          ...fieldsValue,
        };
        if (err) return;
        this.setState(
          () => {
            handleUpdate(temp);
          },
        );
      });

    };
    return (
      <Modal
        title={`信息修改`}
        visible={NoteModalVisable}
        onOk={onOk}
        onCancel={this.onCancel}
      >
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }}>
          {getFieldDecorator('deptcode', {
            initialValue: values.deptcode,
          })(<Input type="hidden"/>)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }}>
          {getFieldDecorator('id', {
            initialValue: values.idString,
          })(<Input type="hidden"/>)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="员工编号">
          {getFieldDecorator('employeeNumber', {
            initialValue: values.employeeNumber,
          })(<Input disabled/>)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="员工姓名">
          {getFieldDecorator('username', {
            initialValue: values.username,
          })(<Input disabled/>)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="部门名称">
          {getFieldDecorator('dept', {
            initialValue: values.dept,
          })(<Input disabled/>)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="员工职位">
          {getFieldDecorator('usertype', {
            initialValue: values.usertype,
          })(<Input disabled/>)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="联系方式">
          {getFieldDecorator('telphone', {
            initialValue: values.telphone,
          })(<Input/>)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="员工权限">
          {getFieldDecorator('level', {
            initialValue: values.level,
          })(<Select placeholder="请选择" style={{ width: '100%' }}>
            <Option value="1">管理员</Option>
            <Option value="2">个人</Option>
          </Select>)}
        </FormItem>

        {getFieldValue(`level`) === '1' && (
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="大全权限">
            {getFieldDecorator('levelname', {
              initialValue: values.levelname,
            })(<Select placeholder="请选择" style={{ width: '100%' }}>
              <Option value="0">全部</Option>
              <Option value="1">东区</Option>
              <Option value="2">南区</Option>
              <Option value="3">西区</Option>
              <Option value="4">北区</Option>
            </Select>)}
          </FormItem>
        )}
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="权限状态">
          {getFieldDecorator('state', {
            initialValue: values.state,
          })(<Select placeholder="请选择" style={{ width: '100%' }}>
            <Option value="1">正常</Option>
            <Option value="2">停用</Option>
          </Select>)}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="备注">
          {getFieldDecorator('remarks', {
            initialValue: values.remarks,
          })(<TextArea  placeholder="请输入备注！最多100字" autosize={{ minRows: 2, maxRows: 4 }} maxLength="100"/>)}
        </FormItem>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ PersonInfo, loading }) => ({
  PersonInfo,
  loading: loading.models.PersonInfo,
}))
@Form.create()
class InfoInputList extends PureComponent {
  state = {
    selectedRows: [],
    fileUrls: [],
    NoteModalVisable: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'PersonInfo/fetch',
    });
    this.handleSearchs();
  }

  /*重置*/
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'PersonInfo/fetch',
      payload: {},
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
      if (fieldsValue.employeeNumber !== '' && fieldsValue.employeeNumber !== undefined) {
        pidR = ('000000000' + fieldsValue.employeeNumber).slice(-9);
      }
      const values = {
        employeeNumber: pidR,
        username: fieldsValue.username !== '' ? fieldsValue.username : undefined,
        dept: fieldsValue.dept !== '' ? fieldsValue.dept : undefined,
        usertype: fieldsValue.usertype !== '' ? fieldsValue.usertype : undefined,
        telphone: fieldsValue.telphone,
        state: fieldsValue.state,
      };
      this.setState({
        formValues: values,
      });
      dispatch({
        type: 'PersonInfo/fetch',
        payload: values,
      });
    });
  };

  handleSearchs = () => {
    const { dispatch, form } = this.props;
    const self = this;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const values = {
        state: fieldsValue.state,
      };
      this.setState({
        formValues: values,
      });
      dispatch({
        type: 'PersonInfo/fetch',
        payload: values,
      });
    });
  };

  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      NoteModalVisable: !!flag,
      recordValues: record || {},
    });
  };

  handleUpdate = fields => {
    const { dispatch } = this.props;
    const self = this;
    new Promise((resolve, reject) => {
      dispatch({
        type: 'PersonInfo/update',
        payload: {
          id: fields.id,
          telphone: fields.telphone,
          level: fields.level,
          remarks: fields.remarks,
          state: fields.state,
          levelname: fields.levelname,
          leveldeptcode: fields.leveldeptcode,
          resolve,
          reject,
        },

      });
    }).then((sta) => {
      if (sta !== null) {
        self.handleFormReset();
        self.updataModalonOk();
        message.success('修改成功！');
        self.setState({
          selectRows: [],
        });
      }
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
              {getFieldDecorator('employeeNumber')(<Input placeholder="请输入"/>)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="员工姓名">
              {getFieldDecorator('username')(<Input placeholder="请输入"/>)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="部门名称">
              {getFieldDecorator('dept')(<Input placeholder="请输入"/>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="员工职位">
              {getFieldDecorator('usertype')(<Input placeholder="请输入"/>)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="联系方式">
              {getFieldDecorator('telphone')(<Input placeholder="请输入"/>)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="权限状态">
              {getFieldDecorator('state', {
                initialValue: '1',
              })(
                <Select placeholder="请选择" style={{ width: '100%' }} allowClear>
                  <Option value="1">正常</Option>
                  <Option value="2">停用</Option>
                </Select>,
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
      visible: false,
      statisticalVisible: false,
    });
  };

  handleCancel = () => {
    this.setState({
      statisticsVisible: false,
      visible: false,
      statisticalVisible: false,
    });
  };

  updataModalonOk = flag => {
    this.setState({
      NoteModalVisable: !!flag,
    });
  };

  updataModalonCancel = () => {
    this.setState({
      NoteModalVisable: false,
    });
  };

  /*删除*/
  remove = () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const ids = selectedRows.map(item => item.idString);
    const self = this;
    confirms({
      title: '确定要删除数据吗?',
      content: '数据将永久删除，不可恢复！',
      onOk() {
        new Promise((resolve, reject) => {
          dispatch({
            type: 'PersonInfo/remove',
            payload: {
              ids: ids,
              resolve,
              reject,
            },

          });
        }).then((sta) => {
          if (sta !== null) {
            self.handleFormReset();
            message.success('删除成功！');
            self.setState({
              selectRows: [],
            });
          }
        });

      },
      onCancel() {
      },
    });
  };

  render() {
    const {
      PersonInfo: { PersonData },
      form: { getFieldDecorator },
      loading,
    } = this.props;
    const { recordValues, NoteModalVisable } = this.state;

    const columns = [
      {
        title: '员工编号',
        dataIndex: 'employeeNumber',
        align: 'center',
      },
      {
        title: '员工姓名',
        dataIndex: 'username',
        align: 'center',
      },
      {
        title: '部门名称',
        dataIndex: 'dept',
        align: 'center',
      },
      {
        title: '员工职位',
        dataIndex: 'usertype',
        align: 'center',
      },
      {
        title: '联系方式',
        dataIndex: 'telphone',
        align: 'center',
      },
      {
        title: '权限级别',
        dataIndex: 'level',
        align: 'center',
        render(val) {
          return levels[val];
        },
      },
      {
        title: '大区权限',
        dataIndex: 'levelname',
        align: 'center',
        render(val) {
          return levelss[val];
        },
      },
      {
        title: '权限状态',
        dataIndex: 'state',
        align: 'center',
        render(val) {
          return states[val];
        },
      },
      {
        title: '备注',
        dataIndex: 'remarks',
        width: '12%',
        render: text => <div className={styles.smileDark} title={text}>{text}</div>,
      },
      {
        title: '操作',
        align: 'center',
        width: '8%',
        render: (text, record) => (
          <Fragment>
            <Tooltip title="修改">
              <a onClick={() => this.handleUpdateModalVisible(true, record)}><Icon type="edit"/></a>
            </Tooltip>
          </Fragment>
        ),
      },
    ];
    const updateMethods = {
      updataModalonOk: this.updataModalonOk,
      updataModalonCancel: this.updataModalonCancel,
      handleUpdate: this.handleUpdate,
    };
    const { selectedRows } = this.state;
    return (
      <PageHeaderWrapper title="人员管理">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>
            <div className={styles.tableListOperator}>
              <Button type="danger"
                      disabled={selectedRows.length === 0}
                      onClick={this.remove}>
                信息删除
              </Button>
            </div>
            <StandardTable
              rowKey="idString"
              selectedRows={selectedRows}
              loading={loading}
              data={PersonData}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        {recordValues && Object.keys(recordValues).length ? (
          <UpdateModal
            {...updateMethods}
            NoteModalVisable={NoteModalVisable}
            values={recordValues}
          />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default InfoInputList;
