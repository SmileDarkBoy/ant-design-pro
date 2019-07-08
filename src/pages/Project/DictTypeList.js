import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row, Col, Card, Form, Icon, List, Menu,
  Input, Select, Modal, Badge, Steps, Radio, Drawer, Table,
  message, Button, Divider, Dropdown, DatePicker, Statistic, Popconfirm, InputNumber
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Ellipsis from '@/components/Ellipsis';

import styles from './InfoList.less';
import DictDataModal from './DictDataModal'

const FormItem = Form.Item;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;

@connect(({ dictRule, loading }) => ({
  dictRule,
  loading: loading.models.dictRule,
}))
@Form.create()
export default class DictTypeList extends PureComponent {
  state = {
    selectedRows: [],
    searchValues: {},
    addDictModal: false,//新增字典类型窗口
    updateDictModal: false,//修改字典类型窗口
    updateDictValue: {}, //当前修改字典类型(row

    dictDataModal: false, //抽屉-字典数据
    dictTypeObj: {} //当前字典数据类型(row
  };

  //初始化
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'dictRule/listData',
      payload: {}
    });
  }

  //----- 查询 -----
  handleSearch = e => {
    if(e != undefined)  e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const values = {
        ...fieldsValue,
        //updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };
      this.setState({
        searchValues: values,
      });
      dispatch({
        type: 'dictRule/listData',
        payload: {
          ...values
        },
      });
    });
  };

  //重置查询条件
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      searchValues: {},
    });
    dispatch({
      type: 'dictRule/listData',
      payload: {},
    });
  };

  //基础查询表单 searchFormFlag(false
  simpleForm = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="字典名称">
              {getFieldDecorator('dictName')(<Input />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="字典类型">
              {getFieldDecorator('dictType')(<Input />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
                <span className={styles.submitButtons}>
                  <Button type="primary" htmlType="submit">
                    查询
                  </Button>
                  <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                    重置
                  </Button>
                </span>
          </Col>
        </Row>
      </Form>
    );
  }

  //行勾选
  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  //菜单(selectRows之后触发
  renderMenus = rows => {
    const downs = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
        <Menu.Item key="approval">批量XX</Menu.Item>
      </Menu>
    );
    const mores = (
      <span>
        <Button>批量操作</Button>
        <Dropdown overlay={downs}>
          <Button>更多操作 <Icon type="down"/></Button>
        </Dropdown>
      </span>
    );
    return rows.length > 0 ? mores : <span></span>
  }

  //菜单Btn逻辑
  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;
    switch (e.key) {
      case 'remove':
        alert('点了删除 ');
        break;
      case 'approval' :
        alert('点了批量操作,该做点什么');
      default:
        break;
    }
  };

  //不知道啥作用
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { searchValues } = this.state;
    const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...searchValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'dictRule/listData',
      payload: params,
    });
  };

  remove = id => {
    const { dispatch } = this.props;
    new Promise((resolve, reject) => {
      dispatch({
        type:'dictRule/remove',
        payload: {
          id: id,
          resolve,
          reject
        }
      })
    }).then(sta => {
      if(sta){
        message.success('删除成功')
        this.handleSearch()
      }else{
        message.error('删除失败')
      }
    })
  }

  handleAddDictModal = flag => {
    this.setState({
      addDictModal: !!flag
    });
  }
  handleAddDict = fields =>{
    const { dispatch } = this.props;
    console.log(fields)
    new Promise((resolve, reject) => {
      dispatch({
        type:'dictRule/add',
        payload: {
          ...fields,
          resolve,
          reject
        }
      })
    }).then(sta => {
      if(sta){
        message.success('添加成功')
        this.handleAddDictModal();
        this.handleSearch()
      }else{
        message.error('添加失败')
      }
    })
    //this.handleAddDictModal();
  }
  checkDictType = value => {
    const { dispatch } = this.props
    return new Promise((resolve, reject) => {
      dispatch({
        type:'dictRule/checkType',
        payload: {
          dictType: value,
          resolve,
          reject
        }
      })
    })
  }

  handleUpdateDictModal = (flag, row) => {
    this.setState({
      updateDictModal: !!flag,
      updateDictValue: row || {}
    })
  }
  handleUpdateDict = fields => {
    const { dispatch } = this.props;
    new Promise((resolve, reject) => {
      dispatch({
        type:'dictRule/update',
        payload: {
          ...fields,
          resolve,
          reject
        }
      })
    }).then(sta => {
      if(sta){
        message.success('修改成功')
        this.handleUpdateDictModal();
        this.handleSearch()
      }else{
        message.error('修改失败')
      }
    })
  }

  handleDictDataModal = (flag,row) => {
    this.setState({
      dictDataModal: !!flag,
      dictTypeObj: row || {}
    })
  }

  render() {
    const { dictRule: { data }, loading,  } = this.props;
    const { selectedRows, addDictModal, dictDataModal, updateDictModal, updateDictValue, dictTypeObj } = this.state;
    const addDictProps = {
      checkDictType: this.checkDictType,
      addDictModal : addDictModal,
      handleAddDictModal : this.handleAddDictModal,
      handleAddDict : this.handleAddDict
    }
    const updateDictPrpos = {
      updateDictModal: updateDictModal,
      updateDictValue: updateDictValue,
      handleUpdateDict: this.handleUpdateDict,
      handleUpdateDictModal: this.handleUpdateDictModal
    }
    const dictDataModalProps = {
      dictDataModal: dictDataModal,
      handleDictDataModal: this.handleDictDataModal,
      dictTypeObj: dictTypeObj
    }

    const columns = [
      {
        title: '字典名称',
        dataIndex: 'dictName',
        width: '25%',
        render: (val, row) => {
          return <a onClick={ () => this.handleUpdateDictModal(true, row) } >{val}</a>
        }
      },
      {
        title: '字典类型',
        dataIndex: 'dictType',
        width: '25%',
        render: (val, row) => {
          return <a onClick={ () => this.handleDictDataModal(true, row) } >{val}</a>
        }
      },
      {
        title: '备注信息',
        dataIndex: 'remarks',
        width: '25%',
        render: (val, row) => {
          return (<Ellipsis length={35} fullWidthRecognition={true} tooltip>{val}</Ellipsis>)
        }
      },
      {
        title: '操作',
        align: 'center',
        render: (text, record) => {
          return (
            <Fragment>
              <a onClick={() => this.handleUpdateDictModal(true,record)}>修改</a>
              <Divider type="vertical" />
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.id)}>
                <a>删除</a>
              </Popconfirm>
            </Fragment>
          );
        },
      },
    ];
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.simpleForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleAddDictModal(true)}>
                新建
              </Button>
              {/*{this.renderMenus(selectedRows)}*/}
            </div>
            <StandardTable
              rowKey='id'
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              bordered={true}
            />
          </div>
        </Card>
        <AddDictForm {...addDictProps}/>
        {updateDictValue && Object.keys(updateDictValue).length ? (<UpdateDictForm {...updateDictPrpos}/>): null}
        {dictTypeObj && Object.keys(dictTypeObj).length ? (<DictDataModal {...dictDataModalProps}/>): null}
      </PageHeaderWrapper >
    );
  }
}

//新建窗口
const AddDictForm = Form.create()(props => {
  const { form: { getFieldDecorator }, form, addDictModal, handleAddDict, handleAddDictModal, checkDictType } = props;
  // 提交
  const okHandle = () => {
    form.validateFields(['dictName','remarks'],(err, fieldsValue) => {
      const dictType = form.getFieldValue('dictType');
      if(dictType === undefined){
        form.setFields({
          dictType: {
            value: dictType,
            errors: [new Error('字典类型不能为空！！！')],
          }
        })
        return;
      }
      const isError = form.getFieldError('dictType');
      if(err != null || isError != undefined) return;

      form.resetFields();
      handleAddDict({...fieldsValue, dictType: dictType});
    });
  };

  //校验字典类型
  const check = (rule, value, callback) => {
    const regHeader = /^[A-Za-z].*$/;  //1个字母开头+(所有字符)任意次
    if(!regHeader.test(value)){
      callback('只能以字母开头');
      return;
    }
    const reg = /^[A-Za-z]\w*$/; //1个字母开头+(字母数字下划线→[A-Za-z0-9_] (任意次→*
    if(!reg.test(value)){
      callback('由字母、数字、下划线构成');
      return;
    }
    callback();
  }
  const blurCheck = (rule, value, callback) =>{
    checkDictType(value).then(res => {
      if(res){
        form.setFields({
          dictType: {
            value: value,
            errors: [new Error('字典类型重复！！！')],
          }
        })
      }
    })
  }
  return (
    <Modal
      destroyOnClose
      maskClosable={false}
      title="新增字典"
      visible={addDictModal}
      onOk={okHandle}
      onCancel={() => handleAddDictModal()}
      width={'50%'}
    >
      <Row>
        <Col span={12}>
          <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 13 }} label="字典名称">
            {form.getFieldDecorator('dictName', {
              rules: [{ required: true, whitespace: true, message: '字典名称不能为空'}],
            })(<Input placeholder="请输入"/>)}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 13 }} label="字典类型">
              {form.getFieldDecorator('dictType',{
                validateFirst: true,
                validate: [
                  {trigger: ['onChange','onBlur'], rules: [
                      { required: true, whitespace: true, message: '字典类型不能为空'},
                      { max: 50, message: '字典类型最大长度为50'},
                      { validator: check }
                    ]},
                  {trigger: 'onBlur', rules: [{ validator: blurCheck }]},]
              })(<Input placeholder="请输入"/>)}
          </FormItem>
        </Col>
      </Row>
      <Row>
          <FormItem style={{marginLeft: 15}} labelCol={{ span: 3 }} wrapperCol={{ span: 19 }} label="备注信息">
            {getFieldDecorator('remarks',
              {
                rules: [{ max: 200, message: '输入字符不可超出200'}],
              })(
              <TextArea rows={3}/>
            )}
          </FormItem>
      </Row>
    </Modal>
  );
});

//修改窗口
@Form.create()
class UpdateDictForm extends PureComponent {
  constructor(props) {
    super(props);
/*    const formVals = props.updateDictValue
    this.state = {
      formVals: {
        key: formVals.key,
        dictType: formVals.dictType,
        dictName: formVals.dictName,
        remarks: formVals.remarks,
        status: formVals.status
      }
    };*/
    this.formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
  }
  //校验字典类型
  check = (rule, value, callback) => {
    const regHeader = /^[A-Za-z].*$/;  //1个字母开头+(所有字符)任意次
    if(!regHeader.test(value)){
      callback('字典类型只能以字母开头');
      return;
    }

    const reg = /^[A-Za-z]\w*$/; //1个字母开头+(字母数字下划线→[A-Za-z0-9_] (任意次→*
    if(!reg.test(value)){
      callback('由字母、数字、下划线构成');
      return;
    }
    callback();
  }
  okHandle = () => {
    const { form, handleUpdateDict } = this.props;
    form.validateFields((err, fields) => {
      if (err) return;
      handleUpdateDict(fields)
    });
  }
  render() {
    const { form: { getFieldDecorator }, updateDictValue, updateDictModal, handleUpdateDictModal } = this.props;

    return (
      <Modal
        destroyOnClose
        maskClosable={false}
        title="修改字典"
        visible={updateDictModal}
        onOk={this.okHandle}
        //centered={true}
        onCancel={() => handleUpdateDictModal()}
        width={'50%'}
      >
        <form>
          {getFieldDecorator('id', {
            initialValue: updateDictValue.id
          })(<Input hidden={true} disabled={true}/>)}
          <Row>
            <Col span={12}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 13 }} label="字典名称">
                {getFieldDecorator('dictName', {
                  rules: [{ required: true, whitespace: true, message: '字典名称不能为空'}],
                  initialValue: updateDictValue.dictName
                })(<Input placeholder="请输入"/>)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 13 }} label="字典类型">
                {getFieldDecorator('dictType', {
                  rules: [{ required: true, whitespace: true, message: '字典类型不能为空'},{ validator: this.check }, ],
                  initialValue: updateDictValue.dictType
                })(<Input disabled={true}/>)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <FormItem style={{marginLeft: 15}} labelCol={{ span: 3 }} wrapperCol={{ span: 19 }} label="备注信息">
              {getFieldDecorator('remarks', {
                rules: [{ max: 200, message: '输入字符不可超出200'}],
                initialValue: updateDictValue.remarks
              })(
                <TextArea rows={3}/>
              )}
            </FormItem>
          </Row>
        </form>
      </Modal>
    );
  }
}
