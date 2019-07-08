import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row, Col, Card, Form, Icon, List, Menu,
  Input, Select, Modal, Badge, Steps, Radio, Drawer, Table, TreeSelect,
  message, Button, Divider, Dropdown, DatePicker, Statistic, Popconfirm, InputNumber 
} from 'antd';
import StandardTable from '@/components/StandardTable';

import styles from './InfoList.less';

const FormItem = Form.Item;
const { TextArea } = Input;

@Form.create()
export default class DictDataModal extends React.Component {
  render = () =>{
    const { form:{ getFieldDecorator }, dictDataModal, handleDictDataModal, dictTypeObj } = this.props
    const title = '编辑字典数据' + (dictDataModal ? '（' + dictTypeObj.dictType + '）' : '');
    return (
      <Drawer
        title={title}
        width={'83.3%'}
        closable={true}
        mask={false}
        visible={dictDataModal}
        onClose={() => handleDictDataModal()}
      >
        <DictDataList dictTypeObj={dictTypeObj}/>
      </Drawer>
    );
  }
}

@connect(({ dictDataRule, loading }) => ({
  dictDataRule,
  loading: loading.models.dictDataRule,
}))
@Form.create()
class DictDataList extends PureComponent {
  state = {
    selectedRows: [],
    searchValues: {},

    addDataModal: false,
    updateFormModal: false,
    updateFormValues: {}
  };

  //初始化
  componentDidMount() {
    const { dispatch,dictTypeObj } = this.props;
    dispatch({
      type: 'dictDataRule/datalist',
      payload:{
        dictType: dictTypeObj.dictType
      }
    });
  }

  //----- 查询 -----
  handleSearch = e => {
    if(e != undefined) e.preventDefault();

    const { dispatch, form, dictTypeObj } = this.props;
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
        type: 'dictDataRule/datalist',
        payload: {
          ...values,
          dictType: dictTypeObj.dictType
        },
      });
    });
  };

  //重置查询条件
  handleFormReset = () => {
    const { form, dispatch, dictTypeObj } = this.props;
    form.resetFields();
    this.setState({
      searchValues: {},
    });
    dispatch({
      type: 'dictDataRule/datalist',
      payload: {
        dictType: dictTypeObj.dictType
      },
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
              {getFieldDecorator('dictLabel')(<Input />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="字典键值">
              {getFieldDecorator('dictValue',{
                validateFirst: true,
                validate: [
                  {trigger: ['onChange','onBlur'], rules: [
                      { max: 6, message: '键值最大长度为6'},
                      { pattern: new RegExp(/^[0-9]*$/), message: '键值由数字构成'},
                    ]}]
              })(<Input />)}
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
  };

  //行勾选
  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleAddModal = flag =>{
    if(flag){
      const { dispatch, dictTypeObj } = this.props
      dispatch({
        type: 'dictDataRule/lastDictDataObj',
        payload:{
          dictType: dictTypeObj.dictType
        }
      });
      dispatch({
        type: 'dictDataRule/getSelectTreeData',
        payload:{
          dictType: dictTypeObj.dictType
        }
      });
    }
    this.setState({
      addDataModal: !!flag
    })
  };
  addData = (fields) => {
    const { dispatch } = this.props;
    new Promise((resolve, reject) => {
      dispatch({
        type:'dictDataRule/saveDictData',
        payload: {
          ...fields,
          resolve,
          reject
        }
      })
    }).then(sta => {
      if(sta){
        message.success('添加成功');
        this.handleAddModal();
        this.handleSearch()
      }else{
        message.error('添加失败')
      }
    })
    this.handleAddModal();
  };
  handleUpdateForm = (flag, record) => {
    if(flag){
      const { dispatch, dictTypeObj } = this.props;
      dispatch({
        type: 'dictDataRule/getSelectTreeData',
        payload:{
          dictType: dictTypeObj.dictType,
          dictCode: record.dictCode
        }
      });
    }
    this.setState({
      updateFormModal: !!flag,
      updateFormValues: record || {}
    })
  }
  updateForm = fields => {
    const { dispatch } = this.props;
    new Promise((resolve, reject) => {
      dispatch({
        type:'dictDataRule/updateDictData',
        payload: {
          ...fields,
          resolve,
          reject
        }
      })
    }).then(sta => {
      if(sta){
        message.success('修改成功')
        this.handleUpdateForm();
        this.handleSearch()
      }else{
        message.error('修改失败')
      }
    })
  }
  remove = dictCode => {
    const { dispatch } = this.props;
    new Promise((resolve, reject) => {
      dispatch({
        type:'dictDataRule/delDictData',
        payload: {
          dictCode: dictCode,
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
  checkDictData = value => {
    const { dispatch, dictTypeObj } = this.props
    return new Promise((resolve, reject) => {
      dispatch({
        type:'dictDataRule/checkData',
        payload: {
          dictType: dictTypeObj.dictType,
          dictValue: value,
          resolve,
          reject
        }
      })
    })
  }

  render() {
    const { dictDataRule: { data, selectTreeData, lastDataObj }, loading, dictTypeObj } = this.props;
    const { selectedRows, addDataModal, updateFormModal, updateFormValues } = this.state;
    const dictTypeName = dictTypeObj.dictType;

    let columns = [
      {
        title: '字典标签',
        dataIndex: 'dictLabel',
        render: (val, record) => {
          return <a onClick={ () => this.handleUpdateForm(true, record) } >{val}</a>
        }
      },
      {
        title: '字典键值',
        dataIndex: 'dictValue',
      },
      {
        title: '排序号',
        dataIndex: 'treeSort',
      },
      {
        title: '描述',
        dataIndex: 'description',
      },

      {
        title: '操作',
        align: 'center',
        render: (text, record) => {
          return (
            <Fragment>
              <a onClick={() => this.handleUpdateForm(true,record)}>修改</a>
              <Divider type="vertical" />
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.dictCode)}>
                <a>删除</a>
              </Popconfirm>
            </Fragment>
          );
        },
      },
    ];
    if(['business_type','project_type','customer_khsx','ceshi'].indexOf(dictTypeName) !== -1){
      columns.splice(2, 0, { title: <span style={{color: '#807888'}}>业务编码*</span>, dataIndex: 'extend1' })
    }
    const addDataParams = {
      dictTypeName: dictTypeName,
      selectTreeData: selectTreeData,
      addDataModal: addDataModal,
      addData: this.addData,
      handleAddModal: this.handleAddModal,
      checkDictData: this.checkDictData,
      lastDataObj: lastDataObj,
    }
    const updateFormParams = {
      dictTypeName: dictTypeName,
      selectTreeData: selectTreeData,
      updateFormModal: updateFormModal,
      updateFormValues: updateFormValues,
      handleUpdateForm:this.handleUpdateForm,
      updateForm: this.updateForm,
    }
    return (
      <Fragment>
        <div className={styles.tableList}>
          <div className={styles.tableListForm}>{this.simpleForm()}</div>
          <div className={styles.tableListOperator}>
            <Button icon="plus" type="primary" onClick={() => this.handleAddModal(true)}>
              新建
            </Button>
          </div>
          <StandardTable
            selectedRows={selectedRows}
            loading={loading}
            data={data}
            columns={columns}
            onSelectRow={this.handleSelectRows}
            bordered={true}
            pagination={false}
          />
        </div>
        <AddDictDataForm {...addDataParams}/>
        {updateFormValues && Object.keys(updateFormValues).length ? (<UpdateForm {...updateFormParams}/>): null}
      </Fragment>
    );
  }
}

//新建窗口
const AddDictDataForm = Form.create()(props => {
  const { form: { getFieldDecorator }, form, addDataModal, addData, handleAddModal, selectTreeData, dictTypeName, checkDictData, lastDataObj } = props;
  const extendFlag = ['business_type','project_type','customer_khsx','ceshi'].indexOf(dictTypeName) !== -1; //是否存在额外字段

  const okHandle = () => {
    let fields = ['parentCode','dictLabel','description'];
    if(extendFlag == true){
      fields.push('extend1');
    }
    form.validateFields(fields,(err, fieldsValue) => {
      const isError = form.getFieldError('dictValue') || form.getFieldError('treeSort');
      if(err != null || isError != undefined) return;
      const dictValue = form.getFieldValue('dictValue');
      const treeSort = form.getFieldValue('treeSort');
      form.resetFields();
      addData({...fieldsValue, dictType: dictTypeName, dictValue: dictValue, treeSort: treeSort});
    });
  };
  const blurCheck = (rule, value, callback) => {
    checkDictData(value).then(res => {
      if(res){
        form.setFields({
          dictValue: {
            value: value,
            errors: [new Error('字典键值重复！！！')],
          }
        })
      }
    })
  }
  return (
    <Modal
      destroyOnClose
      maskClosable={false}
      title="新增字典数据"
      visible={addDataModal}
      onOk={okHandle}
      onCancel={() => handleAddModal()}
      width={'50%'}
    >
      <Row>
        <Col span={12}>
          <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 13 }} label="上级字典">
            {getFieldDecorator('parentCode')(
              <TreeSelect
              showSearch
              allowClear
              style={{ width: 194.5 }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={selectTreeData}
              treeNodeFilterProp={'title'}
              >
              </TreeSelect>
            )}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 13 }} label="排序号">
            {getFieldDecorator('treeSort', {
              validateFirst: true,
              validate: [
                {trigger: ['onChange','onBlur'], rules: [
                    { max: 6, message: '排序号最大长度为6'},
                    { pattern: new RegExp(/^[0-9]*$/), message: '排序号由数字构成'},
                  ]}],
              initialValue: (lastDataObj === undefined ? 0 : lastDataObj.treeSort)+30
            })(<Input/>)}
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 13 }} label="字典标签">
            {getFieldDecorator('dictLabel', {
              rules: [{ required: true, whitespace: true, message: '字典名称不能为空'}],
            })(<Input placeholder="请输入"/>)}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 13 }} label="字典键值">
            {getFieldDecorator('dictValue', {
              validateFirst: true,
              validate: [
                {trigger: ['onChange','onBlur'], rules: [
                    { required: true, whitespace: true, message: '键值不能为空'},
                    { max: 6, message: '键值最大长度为6'},
                    { pattern: new RegExp(/^[0-9]*$/), message: '键值由数字构成'},
                  ]},
                {trigger: 'onBlur', rules: [{ validator: blurCheck }]}],
                initialValue: (lastDataObj === undefined ? 0 : lastDataObj.dictValue)+1
            })(<Input/>)}
          </FormItem>
        </Col>
      </Row>
      <Row>
        <FormItem style={{marginLeft: 15}} labelCol={{ span: 3 }} wrapperCol={{ span: 19 }} label="描述">
          {getFieldDecorator('description', {})(
            <TextArea rows={3}/>
          )}
        </FormItem>
      </Row>
      <Row>
        <Col span={12}>
          { extendFlag ?
            (
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 13 }} label="业务编码">
                {getFieldDecorator('extend1',{
                  rules:[{ required: true, whitespace: true, message: '业务编码不能为空'}]
                })(<Input/>)}
              </FormItem>
            ) : null}

        </Col>
      </Row>
    </Modal>
  )
});

//修改窗口
@Form.create()
class UpdateForm extends PureComponent {
  okHandle = () => {
    const { form, updateForm } = this.props;

    form.validateFields(['dictCode','parentCode','dictLabel','description','extend1'],(err, fieldsValue) => {
      const isError = form.getFieldError('dictValue') || form.getFieldError('treeSort');
      if(err != null || isError != undefined) return;
      const treeSort = form.getFieldValue('treeSort');
      form.resetFields();
      updateForm({...fieldsValue, treeSort: treeSort});
    });
  };
  render() {
    const { form: { getFieldDecorator }, updateFormValues, updateFormModal, handleUpdateForm, selectTreeData, dictTypeName } = this.props;
    return (
      <Modal
        destroyOnClose
        maskClosable={false}
        title="修改字典"
        visible={updateFormModal}
        onOk={this.okHandle}
        //centered={true}
        onCancel={() => handleUpdateForm()}
        width={'50%'}
      >
        <form>
          {getFieldDecorator('dictCode', {
            initialValue: updateFormValues.dictCode
          })(<Input hidden={true} disabled={true}/>)}
          <Row>
            <Col span={12}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 13 }} label="上级字典">
                {getFieldDecorator('parentCode',{
                  initialValue: updateFormValues.parentCode == 0 ? '' : updateFormValues.parentCode
                })(
                  <TreeSelect
                    showSearch
                    allowClear
                    style={{ width: 194.5 }}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={selectTreeData}
                    treeDefaultExpandedKeys={[updateFormValues.parentCode+'_selectTree']}
                    treeNodeFilterProp={'title'}>
                  </TreeSelect>
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 13 }} label="排序号">
                {getFieldDecorator('treeSort', {
                  validateFirst: true,
                  validate: [
                    {trigger: ['onChange','onBlur'], rules: [
                        { max: 6, message: '排序号最大长度为6'},
                        { pattern: new RegExp(/^[0-9]*$/), message: '排序号由数字构成'},
                      ]}],
                  initialValue: updateFormValues.treeSort
                })(<Input placeholder="请输入"/>)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 13 }} label="字典标签">
                {getFieldDecorator('dictLabel', {
                  rules: [{ required: true, whitespace: true, message: '字典标签不能为空'}], initialValue: updateFormValues.dictLabel
                })(<Input placeholder="请输入"/>)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 13 }} label="字典键值">
                {getFieldDecorator('dictValue', {
                  rules: [{ required: true, whitespace: true, message: '字典键值不能为空'}],initialValue: updateFormValues.dictValue
                })(<Input disabled={true}/>)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <FormItem style={{marginLeft: 15}} labelCol={{ span: 3 }} wrapperCol={{ span: 19 }} label="描述">
              {getFieldDecorator('description', {
                initialValue: updateFormValues.description
              })(<TextArea rows={3}/>)}
            </FormItem>
          </Row>
          <Row>
            <Col span={12}>
              {  ['business_type','project_type','customer_khsx','ceshi'].indexOf(dictTypeName) !== -1 ?
                (
                  <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 13 }} label="业务编码">
                    {getFieldDecorator('extend1',{
                      initialValue: updateFormValues.extend1,
                      rules:[{ required: true, whitespace: true, message: '业务编码不能为空'}]
                    })(<Input/>)}
                  </FormItem>
                ) : null}

            </Col>
          </Row>
        </form>
      </Modal>
    );
  }
}
