import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row, Col, Card, Form, Icon, List, Menu,
  Input, Select, Modal, Badge, Steps, Radio, Drawer, Table,
  message, Button, Divider, Dropdown, DatePicker, Statistic, Popconfirm, InputNumber, TreeSelect,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import RenderAuthorized from '@/components/Authorized';

import styles from './InfoList.less';
import BaseTable from './BaseTable';
import Ellipsis from '@/components/Ellipsis';
import Redirect from 'umi/redirect';

const FormItem = Form.Item;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;

//导入infoRule接口等
@connect(({ infoRule, loading }) => ({
  infoRule,
  loading: loading.models.infoRule,
}))
@Form.create()
class InfoList extends PureComponent {
  state = {
    addFormVisible: false,
    updateFormVisble: false,

    infoManageVisible: false,
    updateXmztVisible: false,

    selectedRows: [],

    formValues: {}, //搜索框val
  };

  //初始化
  componentDidMount() {
    const { dispatch, infoRule: { defaultVal } } = this.props;
    dispatch({
        type: 'infoRule/getList',
        payload: {}
      });

    dispatch({
      type: 'infoRule/getComponents',
      payload:{
        businessType: {
          dictType: 'business_type'
        },
        projectType: {
          dictType: 'project_type'
        },
        dictTypeParams: {
          dictTypes: 'business_type,project_type,customer_qrfs,customer_khsx,project_xmzt,project_jurisdiction,is_yes_no'
        },
        citySelectTree: {
          lastType: "'city'"
        }
      }
    });
    dispatch({
      type: 'infoRule/getUserDict',
      payload:{}
    });

  }

  handleAddFormVisible = flag => {
    this.setState({
      addFormVisible: !!flag,
    });
  }
  saveAddForm = (fields,form) => {
    const { dispatch } = this.props;
    const promise = new Promise((resolve, reject) => {
      dispatch({
        type: 'infoRule/isOnlyXmba',
        payload: {
          ...fields,
          resolve,
          reject
        }
      })
    })
    promise.then(sta => {
      if (sta) {
        form.resetFields();
        new Promise((resolve, reject) => {
          dispatch({
            type: 'infoRule/saveAddForm',
            payload: {
              ...fields,
              resolve,
              reject
            }
          })
        }).then(sta => {
          if (sta) {
            message.success('保存成功')
            this.handleAddFormVisible();
            this.handleSearch()
          } else {
            message.error('保存失败')
          }
        })
      } else {
        message.error('编码已存在')
      }
    })
  }
  handleUpdateVisible = (flag, record) =>{
    if(flag){
      const { dispatch } = this.props
      dispatch({
        type: 'infoRule/getInf',
        payload: {
          infoId: record.id
        }
      })
    }
    this.setState({
      updateFormVisble: !!flag,
    });
  }
  saveUpdateForm = fields => {
    const { dispatch } = this.props;
    new Promise((resolve, reject) => {
      dispatch({
        type:'infoRule/update',
        payload: {
          ...fields,
          resolve,
          reject
        }
      })
    }).then(sta => {
      if(sta){
        message.success('修改成功')
        this.handleUpdateVisible();
        this.handleSearch()
      }else{
        message.error('修改失败')
      }
    })
  }

  handleInfoManageVisible = (flag, record) => {
    if(flag){
      const { dispatch } = this.props
      dispatch({
        type: 'infoRule/getInf',
        payload: {
          infoId: record.id
        }
      })
    }
    this.setState({
      infoManageVisible: !!flag,
    });
  };
  saveInfoManage = fields => {
    const { dispatch } = this.props;
    new Promise((resolve, reject) => {
      dispatch({
        type:'infoRule/saveUpForm',
        payload: {
          ...fields,
          resolve,
          reject
        }
      })
    }).then(sta => {
      if(sta){
        message.success('保存成功')
        this.handleInfoManageVisible();
        this.handleSearch()
      }else{
        message.error('保存失败')
      }
    })
  }

  handleUpdateXmztVisible = (flag, record) => {
    if(flag){
      const { dispatch } = this.props
      dispatch({
        type: 'infoRule/getInf',
        payload: {
          infoId: record.id
        }
      })
    }
    this.setState({
      updateXmztVisible: !!flag
    });
  }
  updateXmzt = fields => {
    const { dispatch } = this.props;
    new Promise((resolve, reject) => {
      dispatch({
        type:'infoRule/updateXmzt',
        payload: {
          ...fields,
          resolve,
          reject
        }
      })
    }).then(sta => {
      if(sta){
        message.success('修改成功')
        this.handleUpdateXmztVisible();
        this.handleSearch()
      }else{
        message.error('修改失败')
      }
    })
  }

  //----- 查询 -----
  handleSearch = e => {
    if(e != undefined ) e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        //updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });
      dispatch({
        type: 'infoRule/getList',
        payload: {
          ...values
        },
      });
      dispatch({
        type: 'infoRule/getUserDict',
        payload:{}
      });
    });
  };

  //重置查询条件
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'infoRule/getList',
      payload: {},
    });
  };

  simpleForm=()=>{
    const { infoRule: { defaultVal },form: { getFieldDecorator }, } = this.props;
    const xmzt = defaultVal.dictTypes == undefined ? undefined : defaultVal.dictTypes['project_xmzt'];
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={12}>
            <FormItem label="项目编码">
              {getFieldDecorator('infoXmbm')(<Input placeholder="请输入"/>)}
            </FormItem>
          </Col>
          <Col md={6} sm={12}>
            <FormItem label="所属地区">
              {getFieldDecorator('infoSsdq')(<Input placeholder="请输入"/>)}
            </FormItem>
          </Col>
          <Col md={6} sm={12}>
            <FormItem label="项目状态">
              {getFieldDecorator('infoXmzt', {})(
                <Select allowClear style={{width:'70%'}}>
                  {xmzt == undefined ? null : xmzt.map(item => (<Option key={item.dictCode} value={item.dictValue}>{item.dictLabel}</Option>))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={12}>
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
  //----- end -----

  remove = id => {
    const { dispatch } = this.props;
    new Promise((resolve, reject) => {
      dispatch({
        type:'infoRule/remove',
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
  };

  //行勾选
  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  render(){
    const { infoRule: { data,info,defaultVal,userDict }, loading, dispatch } = this.props;
    const { addFormVisible, updateFormVisble, infoManageVisible, updateXmztVisible,  selectedRows} = this.state;

    const currentUser = defaultVal.currentUser
    const userFlag = currentUser == undefined ? false : (currentUser.type != '' ? true : false)

    const dict = defaultVal.dictTypes
    const columns = [
      {
        title: '项目编码',
        dataIndex: 'infoXmbm',
        width: '15%',
        //fixed: 'left',
        render: (text, record) =>{
          if(userFlag){
            return <a onClick={() => this.handleUpdateVisible(true, record)}>{text}</a>
          }else{
            return text;
          }
        }
      },
      {
        title: '所属地区',
        dataIndex: 'infoSsdq',
        width: '15%',
        render: (val, row) => {
          return (<Ellipsis length={22} fullWidthRecognition={true} tooltip>{val}</Ellipsis>)
        }
      },
      {
        title: '所属辖区',
        dataIndex: 'infoSsxq',
        width: '0%',
        render(val){
          const dictData = dict == undefined ? [] : dict['project_jurisdiction'];
          if(dictData){
            const category = dictData.filter(item => item.dictValue == val);
            val = category.length > 0 ? category[0].dictLabel : val;
          }
          return val;
        }
      },
      {
        title: '业务类型',
        dataIndex: 'infoYwlx',
        width: '10%',
        render(val){
          const dictData = dict == undefined ? [] : dict['business_type'];
          if(dictData){
            const category = dictData.filter(item => item.dictValue == val);
            val = category.length > 0 ? category[0].dictLabel : val;
          }
          return val;
        }
      },
      {
        title: '项目类型',
        dataIndex: 'infoXmlx',
        width: '10%',
        render(val){
          const dictData = dict == undefined ? [] : dict['project_type'];
          if(dictData){
            const category = dictData.filter(item => item.dictValue == val);
            val = category.length > 0 ? category[0].dictLabel : val;
          }
          return val;
        }
      },
      {
        title: '状态',
        dataIndex: 'infoXmzt',
        width: '8%',
        render(val){
          const dictData = dict == undefined ? [] : dict['project_xmzt'];
          if(dictData){
            const category = dictData.filter(item => item.dictValue == val);
            val = category.length > 0 ? category[0].dictLabel : val;
          }
          return val;
        }
      },
      {
        title: '项目负责人',
        dataIndex: 'infoFzr',
        width: '0%',
        render(val){
          return userDict[val] == undefined ? val : userDict[val].username;
        }
      },
      {
        title: '创建时间',
        dataIndex: 'createDate',
        render(val){
          return val == '' ?  '' : val.substring(0,10);
        }
      },
      {
        title: '操作',
        align: 'center',
        //fixed: 'right',
        width: '15%',
        render: (text, record) => {
          if(userFlag){
           return(
             <Fragment>
               <a onClick={() => this.handleUpdateVisible(true, record)}>修改</a>
               <Divider type="vertical" />
               <a onClick={() => this.handleInfoManageVisible(true, record)}>管理</a>
               <Divider type="vertical" />
               <a onClick={() => this.handleUpdateXmztVisible(true, record)}>状态</a>
               <Divider type="vertical" />
               <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.id)}>
                 <a>删除</a>
               </Popconfirm>
             </Fragment>
           )
          }else {
            return(
              <Fragment>
                <a onClick={() => this.handleInfoManageVisible(true, record)}>管理</a>
              </Fragment>
            )
          }
        },
      },
    ];

    const addFormProps = {
      visible: addFormVisible,
      handleVisible: this.handleAddFormVisible,
      saveAddForm: this.saveAddForm,
      defaultVal: defaultVal,
    }
    const updateFormProps = {
      info: info,
      visible: updateFormVisble,
      handleVisible: this.handleUpdateVisible,
      saveUpdateForm: this.saveUpdateForm,
      defaultVal: defaultVal,
    }
    const infoManageProps = {
      info: info,
      visible: infoManageVisible,
      handleVisible: this.handleInfoManageVisible,
      saveInfoManage: this.saveInfoManage,
      userSelectTree: defaultVal.userSelectTree
    };
    const updateXmztProps = {
      visible: updateXmztVisible,
      handleVisible: this.handleUpdateXmztVisible,
      updateXmzt: this.updateXmzt,
      formVals: info,
      dict: dict
    }
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.simpleForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleAddFormVisible(true)}>
                新建报备项目
              </Button>
            </div>
            <StandardTable
              rowKey='id'
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
            />
          </div>
        </Card>
        <CreateForm {...addFormProps}/>
        {info && Object.keys(info).length ? (<UpdateForm {...updateFormProps}/>): null}
        {info && Object.keys(info).length ? (<InfoManage {...infoManageProps}/>): null}
        {info && Object.keys(info).length ? (<UpdateXmzt {...updateXmztProps}/>): null}
      </PageHeaderWrapper>
    );
  }
}

//新建窗口
const CreateForm = Form.create()(props => {
  const { form, visible, handleVisible, saveAddForm, defaultVal } = props;
  const dict = defaultVal.dictTypes
  const getFieldDecorator = form.getFieldDecorator;
  const ssxq = dict == undefined ? undefined : dict['project_jurisdiction']
  const qrfs = dict == undefined ? undefined : dict['customer_qrfs'];
  const khsx = dict == undefined ? undefined : dict['customer_khsx'];

  const okHandle = () => {
    form.validateFields((err, fields) => {
      if (err) return;
      let infoCustomerEntityList = fields.infoCustomerEntityList;
      const infoAgencyEntityList = fields.infoAgencyEntityList;
      if(infoCustomerEntityList.length <= 0){
        message.error('至少添加1条联系人信息。');
        return;
      }
      /*if(infoAgencyEntityList.length <= 0){
        message.error('至少添加1条代理商信息。');
        return;
      }*/
      infoCustomerEntityList.map(item => {
        item.customerDwmc = fields.customerDwmc
        item.customerKhsx = fields.customerKhsx
        item.customerQrfs = fields.customerQrfs
      })

      //form.resetFields();
      saveAddForm(fields,form);
    });
  };

  return (
    <Modal
      destroyOnClose
      centered={true}
      maskClosable={false}
      title="新建项目"
      visible={visible}
      onOk={okHandle}
      onCancel={() => handleVisible()}
      width={1080}
    >
      <Card style={{marginTop:'-25px'}} title={<strong>基本参数</strong>} bordered={false}>
        <Row>
          <Col span={8}>
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="业务类型">
              {getFieldDecorator('infoYwlx',{
                rules:[{ required: true, whitespace: true, message: '业务类型不能为空'}],
              })(
                <TreeSelect
                  showSearch
                  allowClear
                  style={{ width: 194.5 }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  treeData={defaultVal.businessType}
                  treeNodeFilterProp={'title'}
                >
                </TreeSelect>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="所属地区">
              {getFieldDecorator('areaCode', {
                rules: [{ required: true, whitespace: true, message: '所属地区不能为空', min: 0, max: 100 }],
              })(
                <TreeSelect
                  showSearch
                  allowClear
                  style={{ width: 194.5 }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  treeData={defaultVal.areaSelectTree}
                  treeNodeFilterProp={'title'}
                >
                </TreeSelect>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="项目负责人">
              {getFieldDecorator('infoFzr', {
                rules: [{ required: true, whitespace: true, message: '项目负责人不能为空'}],
              })(
                <TreeSelect
                  showSearch
                  allowClear
                  style={{ width: 194.5 }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  treeData={defaultVal.userSelectTree}
                  treeNodeFilterProp={'filter'}
                >
                </TreeSelect>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="项目类型">
              {getFieldDecorator('infoXmlx',{
                rules:[{ required: true, whitespace: true, message: '项目类型不能为空'}],
              })(
                <TreeSelect
                  showSearch
                  allowClear
                  style={{ width: 194.5 }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  treeData={defaultVal.projectType}
                  treeNodeFilterProp={'title'}
                >
                </TreeSelect>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="所属辖区">
              {getFieldDecorator('infoSsxq', {
                rules: [{ required: true, whitespace: true, message: '所属辖区不能为空'}],
              })(<Select allowClear style={{width:'100%'}}>
                {ssxq == undefined ? null : ssxq.map(item => (
                  <Option key={item.dictCode} value={item.dictValue+''}>
                    {item.dictLabel}
                  </Option>
                ))}
              </Select>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="归属部门">
              {getFieldDecorator('infoGsbm', {
                rules: [{ required: true, whitespace: true, message: '归属部门不能为空' }],
              })(<TreeSelect
                showSearch
                allowClear
                style={{ width: 194.5 }}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                treeData={defaultVal.deptSelectTree}
                treeNodeFilterProp={'title'}
              >
              </TreeSelect>)}
            </FormItem>
          </Col>
        </Row>
      </Card>
      <Card style={{marginTop:'-30px'}} title={<strong>客户基本信息</strong>} bordered={false}>
        <Row>
          <Col span={8}>
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="单位名称">
              {getFieldDecorator('customerDwmc',{
                rules:[{ required: true, whitespace: true, message: '单位名称不能为空'}],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="客户属性">
              {getFieldDecorator('customerKhsx', {
                rules: [{ required: true, message: '客户属性不能为空'}],
              })(
                <Select style={{width:'100%'}} >
                  {khsx == undefined ? null : khsx.map(item => (<Option key={item.dictCode} value={item.dictValue}>{item.dictLabel}</Option>))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="切入方式">
              {getFieldDecorator('customerQrfs', {
                rules: [{ required: true, message: '切入方式不能为空'}],
              })(
                <Select style={{width:'100%'}} >
                  {qrfs == undefined ? null : qrfs.map(item => (<Option key={item.dictCode} value={item.dictValue}>{item.dictLabel}</Option>))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        {getFieldDecorator('infoCustomerEntityList', {
          initialValue : []
        })(<Customer getFieldDecorator={getFieldDecorator} infoId={null}/>)}
      </Card>
      <Card style={{marginTop:'-30px'}} title={<strong>代理商信息</strong>} bordered={false}>
        {getFieldDecorator('infoAgencyEntityList', {
          initialValue : []
        })(<Agency getFieldDecorator={getFieldDecorator} citySelectTree={defaultVal.citySelectTree} infoId={null}/>)}
      </Card>
      <Card style={{marginTop:'-30px'}} title={<strong>项目基本信息</strong>} bordered={false}>
        <Row>
          <Col span={8}>
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="项目预算(元)">
              {getFieldDecorator('infoXmys', {})(
                <InputNumber min={0} style={{width:189}} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="是否招投标">
              {getFieldDecorator('infoSfztb', {
                rules: [{ required: true, message: '招投标不能为空'}],
              })(
                <Select allowClear style={{width:'100%'}}>
                  <Option key='infoSfztb_select_yes' value='1'>是</Option>
                  <Option key='infoSfztb_select_no' value='0'>否</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="招标方式">
              {getFieldDecorator('infoZbfs',{})(<Input/>)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="招标时间">
              {getFieldDecorator('infoZbsj', {
                rules: [{ required: true, message: '招标时间不能为空'}],
              })(<DatePicker style={{ width: '100%' }} />,)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="成立项目组">
              {getFieldDecorator('infoSfclxmz', {})(
                <Select allowClear style={{width:'100%'}}>
                  <Option key='infoSfclxmz_select_yes' value='1'>是</Option>
                  <Option key='infoSfclxmz_select_no' value='0'>否</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="经费来源">
              {getFieldDecorator('infoJfly',{})(<Input />)}
            </FormItem>
          </Col>
        </Row>
      </Card>
    </Modal>
  );
});
//修改基本信息
@Form.create()
class UpdateForm extends PureComponent{
  okHandle = () => {
    const { form,saveUpdateForm } = this.props;
    form.validateFields((err, fields) =>{
      if (err) return;
      let infoCustomerEntityList = fields.infoCustomerEntityList;
      const infoAgencyEntityList = fields.infoAgencyEntityList;
      if(infoCustomerEntityList.length <= 0){
        message.error('至少添加1条联系人信息。');
        return;
      }
     /* if(infoAgencyEntityList.length <= 0){
        message.error('至少添加1条代理商信息。');
        return;
      }*/
      infoCustomerEntityList.map(item => {
        item.customerDwmc = fields.customerDwmc
        item.customerKhsx = fields.customerKhsx
        item.customerQrfs = fields.customerQrfs
      })
      form.resetFields();
      saveUpdateForm(fields);
    })
  }
  render(){
    const { form, info, visible, handleVisible, defaultVal } = this.props;
    const dict = defaultVal.dictTypes
    const getFieldDecorator = form.getFieldDecorator;

    const flag = dict == undefined;
    const ssxq = flag ? undefined : dict['project_jurisdiction']
    const qrfs = flag ? undefined : dict['customer_qrfs'];
    const khsx = flag ? undefined : dict['customer_khsx'];
    let ywlx = info.infoYwlx;
    let xmlx = info.infoXmlx;
    if(!flag){
      dict['business_type'].map(item => {
        if(item.dictValue == ywlx){
          ywlx = item.dictLabel
        }
      });
      dict['project_type'].map(item => {
        if(item.dictValue == xmlx){
          xmlx = item.dictLabel
        }
      });
    }
    const xmzt = flag ? undefined : dict['project_xmzt'][info.infoXmzt];
    const infoCustomerEntityList = info.infoCustomerEntityList;
    const infoAgencyEntityList = info.infoAgencyEntityList;
    return (
      <Modal
        destroyOnClose
        centered={true}
        maskClosable={false}
        visible={visible}
        onOk={this.okHandle}
        onCancel={() => handleVisible()}
        width={1080}
      >
        <div style={{fontSize: '30px'}}><strong>{info.infoXmbm}</strong></div>
        <span style={{fontSize: '15px'}}>
           <strong>
          {info.infoSsdq + '/' + (ywlx) + '-' +
          (xmlx)+ '-项目管理页'}
        </strong>
        </span>
        <br/>
        <span style={{fontSize: '13px',color:'gray'}}>
          {'项目状态: ' + (xmzt == undefined ? info.infoXmzt : xmzt.dictLabel)}
        </span>
        <Card title={<strong>基本参数</strong>} bordered={false}>
          {getFieldDecorator('id',{
            rules:[{ required: true, whitespace: true, message: '异常'}],
            initialValue: info.id
          })(<Input hidden={true} disabled={true}/>)}
          <Row>
            <Col span={8}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="业务类型">
                {getFieldDecorator('infoYwlx',{
                  rules:[{ required: true, whitespace: true, message: '业务类型不能为空'}],
                  initialValue: info.infoYwlx
                })(
                  <TreeSelect
                    showSearch
                    allowClear
                    style={{ width: 194.5 }}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={defaultVal.businessType}
                    treeNodeFilterProp={'title'}
                  >
                  </TreeSelect>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="所属地区">
                {getFieldDecorator('areaCode', {
                  rules: [{ required: true, whitespace: true, message: '所属地区不能为空', min: 0, max: 100 }],
                  initialValue: info.areaCode
                })(
                  <TreeSelect
                    showSearch
                    allowClear
                    style={{ width: 194.5 }}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={defaultVal.areaSelectTree}
                    treeNodeFilterProp={'title'}
                  >
                  </TreeSelect>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="项目负责人">
                {getFieldDecorator('infoFzr', {
                  rules: [{ required: true, whitespace: true, message: '项目负责人不能为空'}],
                  initialValue: info.infoFzr
                })(
                  <TreeSelect
                    showSearch
                    allowClear
                    style={{ width: 194.5 }}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={defaultVal.userSelectTree}
                    treeNodeFilterProp={'filter'}
                  >
                  </TreeSelect>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="项目类型">
                {getFieldDecorator('infoXmlx',{
                  rules:[{ required: true, whitespace: true, message: '项目类型不能为空'}],
                  initialValue: info.infoXmlx
                })(
                  <TreeSelect
                    showSearch
                    allowClear
                    style={{ width: 194.5 }}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={defaultVal.projectType}
                    treeNodeFilterProp={'title'}
                  >
                  </TreeSelect>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="所属辖区">
                {getFieldDecorator('infoSsxq', {
                  rules: [{ required: true, whitespace: true, message: '所属辖区不能为空'}],
                  initialValue: info.infoSsxq
                })(<Select allowClear style={{width:'100%'}}>
                  {ssxq == undefined ? null : ssxq.map(item => (
                    <Option key={item.dictCode} value={item.dictValue+''}>
                      {item.dictLabel}
                    </Option>
                  ))}
                </Select>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="归属部门">
                {getFieldDecorator('infoGsbm', {
                  rules: [{ required: true, whitespace: true, message: '归属部门不能为空' }],
                  initialValue: info.infoGsbm
                })(<TreeSelect
                  showSearch
                  allowClear
                  style={{ width: 194.5 }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  treeData={defaultVal.deptSelectTree}
                  treeNodeFilterProp={'title'}
                >
                </TreeSelect>)}
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card style={{marginTop:'-30px'}} title={<strong>客户基本信息</strong>} bordered={false}>
          <Row>
            <Col span={8}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="单位名称">
                {getFieldDecorator('customerDwmc',{
                  rules:[{ required: true, whitespace: true, message: '单位名称不能为空'}],
                  initialValue: infoCustomerEntityList.length == 0 ? '' : infoCustomerEntityList[0].customerDwmc
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="客户属性">
                {getFieldDecorator('customerKhsx', {
                  rules: [{ required: true, message: '客户属性不能为空'}],
                  initialValue: infoCustomerEntityList.length == 0 ? '' : infoCustomerEntityList[0].customerKhsx
                })(
                  <Select style={{width:'100%'}} >
                    {khsx == undefined ? null : khsx.map(item => (<Option key={item.dictCode} value={item.dictValue+''}>{item.dictLabel}</Option>))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="切入方式">
                {getFieldDecorator('customerQrfs', {
                  rules: [{ required: true, message: '切入方式不能为空'}],
                  initialValue: infoCustomerEntityList.length == 0 ? '' : infoCustomerEntityList[0].customerQrfs
                })(
                  <Select style={{width:'100%'}} >
                    {qrfs == undefined ? null : qrfs.map(item => (<Option key={item.dictCode} value={item.dictValue+''}>{item.dictLabel}</Option>))}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          {getFieldDecorator('infoCustomerEntityList', {
            initialValue : infoCustomerEntityList.length == 0 ? [] : infoCustomerEntityList
          })(<Customer getFieldDecorator={getFieldDecorator} infoId={info.id}/>)}
        </Card>
        <Card style={{marginTop:'-30px'}} title={<strong>代理商信息</strong>} bordered={false}>
          {getFieldDecorator('infoAgencyEntityList', {
            initialValue : infoAgencyEntityList == undefined ? [] : infoAgencyEntityList
          })(<Agency getFieldDecorator={getFieldDecorator} infoId={info.id} citySelectTree={defaultVal.citySelectTree}/>)}
        </Card>
        <Card style={{marginTop:'-30px'}} title={<strong>项目基本信息</strong>} bordered={false}>
          <Row>
            <Col span={8}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="项目预算(元)">
                {getFieldDecorator('infoXmys', {
                  initialValue: info.infoXmys
                })(<InputNumber min={0} style={{width:189}}  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="是否招投标">
                {getFieldDecorator('infoSfztb', {
                  rules: [{ required: true, message: '招投标不能为空'}],
                  initialValue: info.infoSfztb == null ? '' : info.infoSfztb+''
                })(
                  <Select allowClear style={{width:'100%'}}>
                    <Option key='infoSfztb_select_yes' value='1'>是</Option>
                    <Option key='infoSfztb_select_no' value='0'>否</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="招标方式">
                {getFieldDecorator('infoZbfs',{
                  initialValue: info.infoZbfs
                })(<Input/>)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="招标时间">
                {getFieldDecorator('infoZbsj', {
                  rules: [{ required: true, message: '招标时间不能为空'}],
                  initialValue: (info.infoZbsj == '' || info.infoZbsj == null) ? null : moment(info.infoZbsj,'YYYY-MM-DD')
                })(<DatePicker style={{ width: '100%' }} />,)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="成立项目组">
                {getFieldDecorator('infoSfclxmz', {
                  initialValue: info.infoSfclxmz == null ? '' : info.infoSfclxmz+''
                })(
                  <Select allowClear style={{width:'100%'}}>
                    <Option key='infoSfclxmz_select_yes' value='1'>是</Option>
                    <Option key='infoSfclxmz_select_no' value='0'>否</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="经费来源">
                {getFieldDecorator('infoJfly',{
                  initialValue: info.infoJfly
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
      </Modal>
    )
  }
}

class Customer extends BaseTable{
  check(e, target){
    let flag = true;
    if (!target.customerFzr || !target.customerLxdh || !target.customerZw || !target.customerKs) {
      message.error('缺少必填项。');
      e.target.focus();
      this.setState({
        loading: false,
      });
      flag = false
    }else if(!/^\p{Number}+$/u.test(target.customerLxdh)){
      message.error('联系电话请输入数字。');
      e.target.focus();
      this.setState({
        loading: false,
      });
      flag = false
    }
    return flag;
  }
  getDefaultValues() {
    const { infoId } = this.props;
    return {
      customerFzr: '',
      customerLxdh: '',
      customerZw: '',
      customerKs: '',
      status: 1,
      infoId: infoId
    }
  }
  render() {
    let { loading,data } = this.state;
    const { getFieldDecorator } = this.props;
    const columns = [
      {
        title: <span>主要负责人<span style={{color: '#f5222d'}}>*</span></span>,
        dataIndex: 'customerFzr',
        key: 'customerFzr',
        width: '20%',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          if (record.editable) {
            return (
              <Input
                value={text}
                onChange={e => this.handleFieldChange(e, 'customerFzr', key)}
              />
            );
          }
          return text;
        },
      },
      {
        title: <span>联系电话<span style={{color: '#f5222d'}}>*</span></span>,
        dataIndex: 'customerLxdh',
        key: 'customerLxdh',
        width: '20%',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          if (record.editable) {
            return (
              <Input
                value={text}
                onChange={e => this.handleFieldChange(e, 'customerLxdh', key)}
              />
            );
          }
          return text
        },
      },
      {
        title: <span>职务<span style={{color: '#f5222d'}}>*</span></span>,
        dataIndex: 'customerZw',
        key: 'customerZw',
        width: '20%',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          if (record.editable) {
            return (
              <Input
                value={text}
                onChange={e => this.handleFieldChange(e, 'customerZw', key)}
              />
            );
          }
          return text
        },
      },
      {
        title: <span>科室<span style={{color: '#f5222d'}}>*</span></span>,
        dataIndex: 'customerKs',
        key: 'customerKs',
        width: '25%',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          if (record.editable) {
            return (
              <Input
                value={text}
                onChange={e => this.handleFieldChange(e, 'customerKs', key)}
              />
            );
          }
          return text
        },
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          const { loading } = this.state;
          if (!!record.editable && loading) {
            return null;
          }
          if (record.editable) {
            if (record.isNew) {
              return (
                <span>
                  <a onClick={e => this.saveRow(e, key)}>添加</a>
                  <Divider type="vertical" />
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(key)}>
                    <a>删除</a>
                  </Popconfirm>
                </span>
              );
            }
            return (
              <span>
                <a onClick={e => this.saveRow(e, key)}>保存</a>
                <Divider type="vertical" />
                <a onClick={e => this.cancel(e, key)}>取消</a>
              </span>
            );
          }
          return (
            <span>
              <a onClick={e => this.toggleEditable(e, key)}>编辑</a>
              <Divider type="vertical" />
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(key)}>
                <a>删除</a>
              </Popconfirm>
            </span>
          );
        },
      },
      {
        dataIndex: 'createDate',
        key: 'customerCreateDate',
        title: false,
        colSpan:0,
        render(text, record){
          return ''
        }
      },
    ]
    return (
      <Fragment>
        <Table
          rowKey='id'
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ y: 240 }}
        />
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={this.newMember}
          icon="plus"
        >
          新增客户信息
        </Button>
      </Fragment>
    );
  }
}
class Agency extends BaseTable{
  check(e, target){
    let flag = true;
    if (!target.agencyDlsqc || !target.agencyLxrxm || !target.agencyLxdh || !target.agencyAreaCode) {
      message.error('缺少必填项。');
      e.target.focus();
      this.setState({
        loading: false,
      });
      flag = false
    }else if(!/^\p{Number}+$/u.test(target.agencyLxdh)){
      message.error('联系电话请输入数字。');
      e.target.focus();
      this.setState({
        loading: false,
      });
      flag = false
    }
    return flag;
  }
  getDefaultValues() {
    const { infoId } = this.props;
    return {
      agencyDlsqc: '',
      agencyAreaCode:'',
      agencyLxrxm: '',
      agencyLxdh: '',
      status: 1,
      infoId: infoId
    }
  }
  handleTree(node, key){
    const { data } = this.state;
    const newData = data.map(item => {
      return ({
        ...item
      })
    });
    const target = this.getRowByKey(key, newData);
    target.agencyAreaCode = node.props.value
    target.agencyAreaName = node.props.fullname
    this.setState({ data: newData });
  }
  render() {
    let { loading,data } = this.state;
    const { getFieldDecorator, citySelectTree } = this.props;
    const columns = [
      {
        title: <span>代理商全称<span style={{color: '#f5222d'}}>*</span></span>,
        dataIndex: 'agencyDlsqc',
        key: 'agencyDlsqc',
        width: '16%',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          if (record.editable) {
            return (<Input value={text} autoFocus onChange={e => this.handleFieldChange(e, 'agencyDlsqc', key)}/>);
          }
          return text;
        },
      },
      {
        title: <span>地区<span style={{color: '#f5222d'}}>*</span></span>,
        dataIndex: 'agencyAreaCode',
        key: 'agencyAreaCode',
        width: '37%',
        align: 'center',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          if (record.editable) {
            return (
              <TreeSelect
                showSearch
                allowClear
                style={{ width: 320  }}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                treeData={citySelectTree}
                treeNodeFilterProp={'title'}
                value={record.agencyAreaCode}
                onSelect={(value, node, extra) => this.handleTree(node, key)}
                showCheckedStrategy={TreeSelect.SHOW_ALL}
              >
              </TreeSelect>
            );
          }
          return record.agencyAreaName == null ? '1' : record.agencyAreaName;
        }
      },
      {
        title: <span>联系人姓名<span style={{color: '#f5222d'}}>*</span></span>,
        dataIndex: 'agencyLxrxm',
        key: 'agencyLxrxm',
        width: '16%',
        align: 'center',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          if (record.editable) {
            return (
              <Input
                value={text}
                onChange={e => this.handleFieldChange(e, 'agencyLxrxm', key)}
              />
            );
          }
          return text;
        },
      },
      {
        title: <span>联系电话<span style={{color: '#f5222d'}}>*</span></span>,
        dataIndex: 'agencyLxdh',
        key: 'agencyLxdh',
        width: '16%',
        align: 'center',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          if (record.editable) {
            return (
              <Input
                value={text}
                onChange={e => this.handleFieldChange(e, 'agencyLxdh', key)}
              />
            );
          }
          return text;
        }
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          const { loading } = this.state;
          if (!!record.editable && loading) {
            return null;
          }
          if (record.editable) {
            if (record.isNew) {
              return (
                <span>
                  <a onClick={e => this.saveRow(e, key)}>添加</a>
                  <Divider type="vertical" />
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(key)}>
                    <a>删除</a>
                  </Popconfirm>
                </span>
              );
            }
            return (
              <span>
                <a onClick={e => this.saveRow(e, key)}>保存</a>
                <Divider type="vertical" />
                <a onClick={e => this.cancel(e, key)}>取消</a>
              </span>
            );
          }
          return (
            <span>
              <a onClick={e => this.toggleEditable(e, key)}>编辑</a>
              <Divider type="vertical" />
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(key)}>
                <a>删除</a>
              </Popconfirm>
            </span>
          );
        },
      },
      {
        dataIndex: 'createDate',
        key: 'agencyCreateDate',
        title: false,
        colSpan:0,
        render(text, record){
          return ''
        }
      }
    ]
    return (
      <Fragment>
        <Table
          rowKey='id'
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ y: 240 }}
        />
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={this.newMember}
          icon="plus"
        >
          新增代理商信息
        </Button>
      </Fragment>
    );
  }
}

//项目管理
@Form.create()
class InfoManage extends PureComponent {
  constructor(props) {
    super(props);
  }
  okHandle = () => {
    const { form,saveInfoManage } = this.props;
    form.validateFields((err, fields) => {
      if (err) return;
      const info = {
        id: fields.infoId,
        infoXmzt: fields.infoXmzt,
        infoRivalEntityList: fields.infoRivalEntityList,
        infoMemberEntityList: fields.infoMemberEntityList,
        infoFollowingEntityList: fields.infoFollowingEntityList,
        infoKxxdyEntity: {
          id: fields.kxxdyId,
          infoId: fields.infoId,
          kxxdyYjhte: fields.kxxdyYjhte,
          kxxdyZq: fields.kxxdyZq,
          kxxdyGm: fields.kxxdyGm,
          kxxdyKexxcs: fields.kxxdyKexxcs,
        }
      }
      form.resetFields();
      saveInfoManage(info);
    });
  }

  render() {
    const { form: { getFieldDecorator }, info, visible, handleVisible,userSelectTree } = this.props;
    const infoKxxdy = info.infoKxxdyEntity
    return (
      <Modal
        width={1080}
        destroyOnClose
        title={"项目管理窗口"}
        centered={true}
        maskClosable={false}
        visible={visible}
        onOk={this.okHandle}
        onCancel={() => handleVisible()}
      >
        {getFieldDecorator('infoXmzt', {
          initialValue: info.infoXmzt
        })(<Input hidden={true} disabled={true}/>)}


        <Card title={<strong>项目组成员</strong>} bordered={true}>
          {getFieldDecorator('infoMemberEntityList', {
            initialValue : info.infoMemberEntityList
          })(<Member infoId={info.id} getFieldDecorator={getFieldDecorator} userSelectTree={userSelectTree}/>)}
        </Card>

        <Card title={<strong>竞争对手</strong>} bordered={true}>
          {getFieldDecorator('infoRivalEntityList', {
            initialValue : info.infoRivalEntityList
          })(<Rival infoId={info.id}/>)}
        </Card>
        <Card title={<strong>跟踪记录</strong>} bordered={true}>
          {getFieldDecorator('infoFollowingEntityList', {
            initialValue : info.infoFollowingEntityList
          })(<Follow infoId={info.id}/>)}
        </Card>
        <Card title={<strong>可行性调研</strong>} bordered={true}>
          <form>
            {getFieldDecorator('infoId', {
              initialValue: infoKxxdy == undefined ? '' : infoKxxdy.infoId
            })(<Input hidden={true} disabled={true}/>)}
            {getFieldDecorator('kxxdyId', {
              initialValue: infoKxxdy == undefined ? '' : infoKxxdy.id
            })(<Input hidden={true} disabled={true}/>)}
            <Row>
              <Col span={12}>
                <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="预计合同额(元)">
                  {getFieldDecorator('kxxdyYjhte', {
                    rules: [{ required: true, message: '预计合同额不能为空'}],
                    initialValue: infoKxxdy == undefined ? '' : infoKxxdy.kxxdyYjhte
                  })(<InputNumber min={0} style={{width:243}} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/>)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="预计周期">
                  {getFieldDecorator('kxxdyZq', {
                    initialValue: infoKxxdy == undefined ? '' : infoKxxdy.kxxdyZq
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="预计规模">
                  {getFieldDecorator('kxxdyGm', {
                    rules: [{ required: true, message: '预计规模不能为空'}],
                    initialValue: infoKxxdy == undefined ? '' : infoKxxdy.kxxdyGm
                  })(<InputNumber min={0} style={{width:243}} placeholder="(数量)" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/>)}
                </FormItem>
              </Col>
            </Row>
            <Row style={{marginLeft: '19px'}}>
              <FormItem labelCol={{ span: 3 }} wrapperCol={{ span: 19 }} label="可行性陈述">
                {getFieldDecorator('kxxdyKexxcs', {
                  rules: [
                    { required: true, whitespace: true, message: '可行性陈述不能为空'},
                    { min:40, message:"至少填写40个字符"},
                    { max:200, message:"填写字符不可超过200"},
                    ],
                  initialValue: infoKxxdy == undefined ? '' : infoKxxdy.kxxdyKexxcs
                })(<TextArea rows={5}/>)}
              </FormItem>
            </Row>
          </form>
        </Card>
      </Modal>
    );
  }
}

//成员card
class Member extends BaseTable {
  check(e, target){
    let flag = true;
    if (!target.memberYgbh || !target.memberYgxm || !target.memberLxdh || !target.memberRzsj) {
      message.error('缺少必填项。');
      e.target.focus();
      this.setState({
        loading: false,
      });
      flag = false
    } else if(!/^\p{Number}+$/u.test(target.memberLxdh)){
      message.error('联系电话请输入数字。');
      e.target.focus();
      this.setState({
        loading: false,
      });
      flag = false
    }
    return flag;
  }
  getDefaultValues() {
    const { infoId } = this.props
    return {
      memberYgbh: '',
      memberYgxm: '',
      memberZnzw: '',
      memberLxdh: '',
      memberRzsj: '',
      memberLzsj: '',
      memberLyfpbl: '',
      status: 1,
      infoId: infoId
    }
  }
  handleTree(node, key){
    const { data } = this.state;
    const newData = data.map(item => {
      return ({
        ...item
      })
    });
    const target = this.getRowByKey(key, newData);
    target.memberYgbh = node.props.value
    target.memberYgxm = node.props.title.split('-')[1]
    this.setState({ data: newData });
  }
  render() {
    let { loading, data } = this.state;
    const { getFieldDecorator, userSelectTree } = this.props;
    const columns = [
      {
        title: <span>员工编号<span style={{color: '#f5222d'}}>*</span></span>,
        dataIndex: 'memberYgbh',
        key: 'memberYgbh',
        width: '12.5%',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          if (record.editable) {
            return <TreeSelect
              showSearch
              allowClear
              style={{ width: 85 }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={userSelectTree}
              treeNodeFilterProp={'filter'}
              value={record.memberYgbh}
              onSelect={(value, node, extra) => this.handleTree(node, key)}
            >
            </TreeSelect>
          }
          return text;
        },
      },
      {
        title: <span>员工姓名<span style={{color: '#f5222d'}}>*</span></span>,
        dataIndex: 'memberYgxm',
        key: 'memberYgxm',
        width: '12.5%',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          if (record.editable) {
            return (
              <Input
                value={text}
                disabled={true}
                onChange={e => this.handleFieldChange(e, 'memberYgxm', key)}
              />
            );
          }
          return text;
        },
      },
      {
        title: '组内职务',
        dataIndex: 'memberZnzw',
        key: 'memberZnzw',
        width: '12.5%',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          if (record.editable) {
            return (
              <Input
                value={text}
                onChange={e => this.handleFieldChange(e, 'memberZnzw', key)}
              />
            );
          }
          return text;
        },
      },
      {
        title: <span>联系电话<span style={{color: '#f5222d'}}>*</span></span>,
        dataIndex: 'memberLxdh',
        key: 'memberLxdh',
        width: '13.5%',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          if (record.editable) {
            return (
              <Input
                value={text}
                onChange={e => this.handleFieldChange(e, 'memberLxdh', key)}
              />
            );
          }
          return text;
        },
      },
      {
        title: <span>入组时间<span style={{color: '#f5222d'}}>*</span></span>,
        dataIndex: 'memberRzsj',
        key: 'memberRzsj',
        width: '12.5%',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          const flag = text == '' || text == null;
          if (record.editable) {
            return (
              <DatePicker
                value={flag ? null : moment(text,'YYYY-MM-DD')}
                placeholder=''
                onChange={(date,dateString) => this.handleFieldChange(dateString, 'memberRzsj', key)}
              />
            );
          }
          return flag ? '' : text.substring(0,10);
        },
      },
      {
        title: '离组时间',
        dataIndex: 'memberLzsj',
        key: 'memberLzsj',
        width: '12.5%',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          const flag = text == '' || text == null;
          if (record.editable) {
            return (
              <DatePicker
                placeholder=''
                value={flag ? null : moment(text,'YYYY-MM-DD')}
                onChange={(date,dateString) => this.handleFieldChange(dateString, 'memberLzsj', key)}
              />
            );
          }
          return flag ? '长期' : text.substring(0,10);
        },
      },
      {
        title: '利益分配',
        dataIndex: 'memberLyfpbl',
        key: 'memberLyfpbl',
        width: '10.5%',
        align: 'center',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          if (record.editable) {
            return (
              <InputNumber style={{width:'75px'}}
                value={text}
                onChange={e => this.handleFieldChange(e, 'memberLyfpbl', key)}
              />
            );
          }
          return text == '' ? '' : text+'%';
        },
      },
      {
        title: '操作',
        key: 'action',
        width:160,
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          const { loading } = this.state;
          if (!!record.editable && loading) {
            return null;
          }
          if (record.editable) {
            if (record.isNew) {
              return (
                <span>
                  <a onClick={e => this.saveRow(e, key)}>添加</a>
                  <Divider type="vertical" />
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(key)}>
                    <a>删除</a>
                  </Popconfirm>
                </span>
              );
            }
            return (
              <span>
                <a onClick={e => this.saveRow(e, key)}>保存</a>
                <Divider type="vertical" />
                <a onClick={e => this.cancel(e, key)}>取消</a>
              </span>
            );
          }
          return (
            <span>
              <a onClick={e => this.toggleEditable(e, key)}>编辑</a>
              <Divider type="vertical" />
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(key)}>
                <a>删除</a>
              </Popconfirm>
            </span>
          );
        },
      },
      {
        dataIndex: 'createDate',
        key: 'memberCreateDate',
        title: false,
        colSpan:0,
        render(text, record){
          return ''
        }
      }
    ]
    return (
      <Fragment>
        <Table
          rowKey='id'
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ y: 240 }}
          scroll={{ x: '110%' }}
        />
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={this.newMember}
          icon="plus"
        >
          新增项目组成员
        </Button>
      </Fragment>
    );
  }
}
//竞争对手card
class Rival extends BaseTable {
  check(e, target){
    let flag = true;
    if (!target.rivalGsxx) {
      message.error('缺少必填项。');
      e.target.focus();
      this.setState({
        loading: false,
      });
      flag = false
    }
    return flag;
  }
  getDefaultValues() {
    const { infoId } = this.props
    return {
      rivalGsxx: '',
      rivalFzrxx: '',
      status: 1,
      infoId: infoId,
    }
  }
  render() {
    const { loading, data } = this.state;
    const columns = [
      {
        title: <span>公司信息<span style={{color: '#f5222d'}}>*</span></span>,
        dataIndex: 'rivalGsxx',
        key: 'rivalGsxx',
        width: '30%',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          if (record.editable) {
            return (
              <Input
                value={text}
                autoFocus
                onChange={e => this.handleFieldChange(e, 'rivalGsxx', key)}

              />
            );
          }
          return text;
        },
      },
      {
        title: '负责人信息',
        dataIndex: 'rivalFzrxx',
        key: 'rivalFzrxx',
        width: '30%',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          if (record.editable) {
            return (
              <Input
                value={text}
                onChange={e => this.handleFieldChange(e, 'rivalFzrxx', key)}
              />
            );
          }
          return text;
        },
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => {
          const { loading } = this.state;
          const key = record.key == undefined ? record.id : record.key
          if (!!record.editable && loading) {
            return null;
          }
          if (record.editable) {
            if (record.isNew) {
              return (
                <span>
                  <a onClick={e => this.saveRow(e, key)}>添加</a>
                  <Divider type="vertical" />
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(key)}>
                    <a>删除</a>
                  </Popconfirm>
                </span>
              );
            }
            return (
              <span>
                <a onClick={e => this.saveRow(e, key)}>保存</a>
                <Divider type="vertical" />
                <a onClick={e => this.cancel(e, key)}>取消</a>
              </span>
            );
          }
          return (
            <span>
              <a onClick={e => this.toggleEditable(e, key)}>编辑</a>
              <Divider type="vertical" />
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(key)}>
                <a>删除</a>
              </Popconfirm>
            </span>
          );
        },
      },
      {
        dataIndex: 'createDate',
        key: 'rivalCreateDate',
        title: false,
        colSpan:0,
        render(text, record){
          return ''
        }
      }
    ]
    return (
      <Fragment>
        <Table
          key='id'
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ y: 240 }}
        />
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={this.newMember}
          icon="plus"
        >
          新增竞争对手
        </Button>
      </Fragment>
    );
  }
}
//项目跟踪记录
class Follow extends BaseTable{
  check(e, target){
    let flag = true;
    if (!target.followingGznr) {
      message.error('缺少必填项。');
      e.target.focus();
      this.setState({
        loading: false,
      });
      flag = false
    }
    return flag;
  }
  getDefaultValues() {
    const { infoId } = this.props
    return {
      followingDjr: '',
      followingGznr: '',
      status: 1,
      infoId: infoId
    }
  }
  render() {
    const { loading, data } = this.state;
    const columns = [
      {
        title: '登记人',
        dataIndex: 'followingDjr',
        key: 'followingDjr',
        width: '10%',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          if (record.editable) {
            return (
              <Input value={text} onChange={e => this.handleFieldChange(e, 'followingDjr', key)}/>
            );
          }
          return text;
        },
      },
      {
        title: <span>跟踪内容<span style={{color: '#f5222d'}}>*</span></span>,
        dataIndex: 'followingGznr',
        key: 'followingGznr',
        width: '65%',
        render: (text, record) => {
          const key = record.key == undefined ? record.id : record.key
          if (record.editable) {
            return (
              <Input value={text} onChange={e => this.handleFieldChange(e, 'followingGznr', key)}/>
            );
          }
          return text;
        },
      },
      {
        dataIndex: 'createDate',
        key: 'followCreateDate',
        title: '登记时间',
        width: '13%',
        render(text, record){
          const flag = text == '' || text == null;
          return flag ? '' : text.split('T')[0].substring(0,10)
        }
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => {
          const { loading } = this.state;
          const key = record.key == undefined ? record.id : record.key
          if (!!record.editable && loading) {
            return null;
          }
          if (record.editable) {
            if (record.isNew) {
              return (
                <span>
                  <a onClick={e => this.saveRow(e, key)}>添加</a>
                  <Divider type="vertical" />
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(key)}>
                    <a>删除</a>
                  </Popconfirm>
                </span>
              );
            }
            return (
              <span>
                <a onClick={e => this.saveRow(e, key)}>保存</a>
                <Divider type="vertical" />
                <a onClick={e => this.cancel(e, key)}>取消</a>
              </span>
            );
          }
          return (
            <span>
              <a onClick={e => this.toggleEditable(e, key)}>编辑</a>
              <Divider type="vertical" />
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(key)}>
                <a>删除</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ]
    return (
      <Fragment>
        <Table
          rowKey='id'
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ y: 240 }}
        />
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={this.newMember}
          icon="plus"
        >
          新增跟踪记录
        </Button>
      </Fragment>
    );
  }
}

const UpdateXmzt = Form.create()(props => {
  const { form, visible, handleVisible, updateXmzt, formVals, dict} = props;
  const getFieldDecorator = form.getFieldDecorator;
  const xmzt = dict['project_xmzt'];

  const okHandle = () => {
    form.validateFields((err, fields) => {
      if (err) return;
      form.resetFields();
      updateXmzt(fields);
    });
  };

  return (
    <Modal
      destroyOnClose
      centered={true}
      maskClosable={false}
      title="变更状态"
      visible={visible}
      onOk={okHandle}
      onCancel={() => handleVisible()}
      width={500}
    >
      <form>
        {getFieldDecorator('id', {
          initialValue: formVals.id
        })(<Input hidden={true} disabled={true}/>)}
      <Row>
        <Col span={20}>
          <FormItem labelCol={{ span: 6}} wrapperCol={{ span: 16 }} label="项目状态">
            {getFieldDecorator('infoXmzt', {
              rules:[{ required: true,  message: '不能为空'}]
            })(
              <Select allowClear style={{width:'100%'}}>
                {xmzt == undefined ? null : xmzt.map(item => {
                  if(item.dictValue >= 4){
                    return <Option key={item.dictCode} value={item.dictValue}>{item.dictLabel}</Option>
                  }
                })}
              </Select>
            )}
          </FormItem>
        </Col>
      </Row>
      </form>
    </Modal>
  );
});

export default InfoList;
