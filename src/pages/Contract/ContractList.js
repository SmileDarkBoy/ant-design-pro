import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row, Col, Card, Form, Icon, List, Menu,
  Input, Select, Modal, Badge, Steps, Radio, Drawer, Table, Upload,
  message, Button, Divider, Dropdown, DatePicker, Statistic, Popconfirm, InputNumber, TreeSelect,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './ContractList.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

//导入infoRule接口等
@connect(({ contractRule, loading }) => ({
  contractRule,
  loading: loading.models.contractRule,
}))
@Form.create()
class ContractList extends PureComponent {
  state = {
    searchForm: {},

    visible: false,
  };
  //初始化
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
        type: 'contractRule/getList',
        payload: { }
      });
    dispatch({
        type: 'contractRule/getUser',
        payload: { }
      });
    dispatch({
      type: 'contractRule/getUserDicts',
      payload: {}
    });
    dispatch({ //获得字典项value
      type: 'contractRule/getDictDataByTypes',
      payload: {
        dictTypes: 'project_xmzt'
      }
    });
  }
//----- 查询 -----
  simpleForm() {
    const { contractRule: { dictTypes },form: { getFieldDecorator }, } = this.props;
    const xmzt = dictTypes == undefined ? [] : dictTypes['project_xmzt'];
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={12}>
            <FormItem label="项目编码">
              {getFieldDecorator('infoXmbm')(<Input placeholder="请输入"/>)}
            </FormItem>
          </Col>
          <Col md={6} sm={12}>
            <FormItem label="项目状态">
              {getFieldDecorator('infoXmzt', {})(
                <Select allowClear style={{width:'100%'}}>
                  {xmzt == undefined ? null : xmzt.map(item => {
                    if(item.dictValue >= 3 && item.dictValue <=4){
                      return <Option key={item.dictCode} value={item.dictValue}>{item.dictLabel}</Option>
                    }
                  })}
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
        searchForm: values,
      });
      dispatch({
        type: 'contractRule/getList',
        payload: {
          ...values
        },
      });
    });
  };
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      searchForm: {},
    });
    dispatch({
      type: 'contractRule/getList',
      payload: {},
    });
  };

  handleVisible = (flag, record) => {
    if(flag){
      const { dispatch } = this.props;
      dispatch({
        type: 'contractRule/getRecord',
        payload: {
          infoId : record.id
        },
      });
      dispatch({
        type: 'contractRule/getFileUpload',
        payload: {
          infoId : record.id
        },
      });
    }
    this.setState({
      visible: !!flag
    });
  }
  saveForm = fields => {
    const { dispatch } = this.props;
    console.log(fields.files)
    new Promise((resolve, reject) => {
      dispatch({
        type:'contractRule/saveForm',
        payload: {
          ...fields,
          resolve,
          reject
        }
      })
    }).then(sta => {
      if(sta){
        message.success('保存成功')
        this.handleVisible();
        this.handleSearch()
      }else{
        message.error('保存失败')
      }
    })
  }

  downFiles = (fileId,fileName) =>{
    const { dispatch } = this.props;
    dispatch({//发送请求
      type:'contractRule/download',
      payload:{
        id: fileId
      },//参数
      callback:(response)=>{
        //这块是下载的重点
        const blob=new Blob([response]);//创建blob对象
        const aLink=document.createElement('a');//创建a链接
        aLink.style.display='none';
        aLink.href=blob;
        aLink.download=fileName;
        document.body.appendChild(aLink);
        aLink.click();
        document.body.removeChild(aLink);//点击完成后记得删除创建的链接
      }
    })
  }

  render() {
    const { contractRule: { data, dictTypes, userDict, contract, files, currentUser }, loading, dispatch } = this.props;
    const { visible } = this.state;
    console.log(currentUser)
    const userFlag = currentUser == undefined ? false : (currentUser.type != '' ? true : false)
    const columns = [
      {
        title: '项目编码',
        dataIndex: 'infoXmbm',
        width: '20%'
      },
      {
        title: '状态',
        dataIndex: 'infoXmzt',
        width: '15%',
        render(val){
          const dictData = dictTypes == undefined ? [] : dictTypes['project_xmzt'];
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
        width: '15%',
        render(val){
          return userDict[val] == undefined ? val : userDict[val].username;
        }
      },
      {
        title: '创建时间',
        dataIndex: 'createDate',
        width: '15%',
        render(val){
          return val == '' ?  '' : val.substring(0,10);
        }
      },
      {
        title: '操作',
        align: 'center',
        render: (text, record) => {
          if(userFlag){
            return (
              <Fragment>
                <a onClick={() => this.handleVisible(true,record)}>合同管理</a>
              </Fragment>
            );
          }
        },
      },
    ];

    const formProps = {
      contract: contract,
      visible: visible,
      saveForm: this.saveForm,
      handleVisible: this.handleVisible,
      files: files,
      downFiles: this.downFiles
    }
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.simpleForm()}</div>
            <div className={styles.tableListOperator}>
            </div>
            <StandardTable
              rowKey='id'
              selectedRows={[]}
              loading={loading}
              data={data}
              columns={columns}
            />
          </div>
        </Card>
        <ContractForm {...formProps}/>
      </PageHeaderWrapper>
    );
  }
}

@Form.create()
class ContractForm extends PureComponent {
  constructor(props) {
    super(props);
    this.formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
  }
  okHandle = () => {
    const temp = this.myUpload.state.files
    let files = []
    temp.map(item =>{
      if(item.status == 1){
        files.push(item.uid)
      }
    })
    const { form,saveForm } = this.props;
    form.validateFields((err, fields) => {
      if (err) return;
      form.resetFields();
      saveForm({...fields,files:files});
    });
  }
  downFiles = (fileId,fileName) =>{
    const { downFiles } = this.props;
    downFiles(fileId,fileName,)
  }
  render() {
    const { form: { getFieldDecorator }, contract, visible, handleVisible, files } = this.props;
    return (
      <Modal
        width={880}
        destroyOnClose
        title="合同管理"
        centered={true}
        maskClosable={false}
        visible={visible}
        onOk={this.okHandle}
        onCancel={() => handleVisible()}
      >
        <form>
          {getFieldDecorator('id', {
            initialValue: contract == undefined ? '' : contract.id
          })(<Input hidden={true} disabled={true}/>)}
          {getFieldDecorator('infoId', {
            rules:[{ required: true, whitespace: true, message: '出现异常,所属项目主键'}],
            initialValue: contract == undefined ? '' : contract.infoId
          })(<Input hidden={true} disabled={true}/>)}
          <Row>
            <Col span={12}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="甲方名称">
                {getFieldDecorator('cjshJfmc', {
                  rules:[{ required: true, whitespace: true, message: '甲方名称不能为空'}],
                  initialValue: contract == undefined ? '' : contract.cjshJfmc
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="乙方名称">
                {getFieldDecorator('cjshYfmc', {
                  rules:[{ required: true, whitespace: true, message: '乙方名称不能为空'}],
                  initialValue: contract == undefined ? '' : contract.cjshYfmc
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
          <Col span={12}>
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="合作类型">
              {getFieldDecorator('cjshHzlx', {
                rules:[{ required: true, whitespace: true, message: '合作类型不能为空'}],
                initialValue: contract == undefined ? '' : contract.cjshHzlx
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="签署日期">
              {getFieldDecorator('cjshHtqsrq', {
                rules:[{ required: true, message: '合同签署日期不能为空'}],
                initialValue: contract == undefined ? null :(contract.cjshHtqsrq == null ? null : moment(contract.cjshHtqsrq,'YYYY-MM-DD'))
              })(<DatePicker style={{width: 242}}/>)}
            </FormItem>
          </Col>
        </Row>
          <Row>
            <Col span={12}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="合同金额">
                {getFieldDecorator('cjshHtje', {
                  rules:[{ required: true, message: '合同金额不能为空'}],
                  initialValue: contract == undefined ? 0 : (contract.cjshHtje == null ? 0 : contract.cjshHtje)
                })(<InputNumber min={0} style={{width:243}}/>)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="回款日期">
                {getFieldDecorator('cjshHkrq', {
                  initialValue: contract == undefined ? null :(contract.cjshHkrq == null ? null : moment(contract.cjshHkrq,'YYYY-MM-DD'))
                })(<DatePicker style={{width: 242}}/>)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="应收账款">
                {getFieldDecorator('cjshYszk', {
                  rules:[{ required: true, message: '应收账款不能为空'}],
                  initialValue: contract == undefined ? 0 : (contract.cjshYszk == null ? 0 : contract.cjshYszk)
                })(<InputNumber min={0} style={{width:243}}/>)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="生效日期">
                {getFieldDecorator('cjshHtsxrq', {
                  rules:[{ required: true, message: '合同生效日期不能为空'}],
                  initialValue: contract == undefined ? null : (contract.cjshHtsxrq == null ? null : moment(contract.cjshHtsxrq,'YYYY-MM-DD'))
                })(<DatePicker style={{width: 242}}/>)}
              </FormItem>
            </Col>
          </Row>
          <Row style={{marginLeft: '19px'}}>
            <FormItem labelCol={{ span: 3 }} wrapperCol={{ span: 19 }} label="备注说明">
              {getFieldDecorator('cjshBz', {
                initialValue: contract == undefined ? '' : contract.cjshBz
              })(<TextArea rows={2}/>)}
            </FormItem>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="中标时间">
                {getFieldDecorator('cjshZbsj', {
                  initialValue: contract == undefined ? null : (contract.cjshZbsj == null ? null : moment(contract.cjshZbsj,'YYYY-MM-DD'))
                })(<DatePicker style={{width: 242}}/>)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} label="中标单位">
                {getFieldDecorator('cjshZbdw', {
                  initialValue: contract == undefined ? '' : contract.cjshZbdw
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
          <Row style={{marginLeft: '19px'}}>
            <FormItem labelCol={{ span: 3 }} wrapperCol={{ span: 19 }} label="中标公示">
              {getFieldDecorator('cjshZbgs', {
                initialValue: contract == undefined ? '' : contract.cjshZbgs
              })(<TextArea rows={2}/>)}
            </FormItem>
          </Row>
        </form>
        <Row style={{marginLeft: '40px'}}>
          <Col span={8}>
            <OldUpload files={files} downFiles={this.downFiles}/>
          </Col>
          <Col span={8}>
            <MyUpload getInstance={myUpload => { this.myUpload = myUpload }} infoId={contract.infoId} />
          </Col>
        </Row>
      </Modal>
    );
  }
}

class MyUpload extends PureComponent{
  constructor(props) {
    super(props);
    const { getInstance } = props;
    getInstance(this);
  }
  state = {
    files: []
  }
  addFiles = async (file) => {
    let { files } = this.state
    const uid = file.response.uid;

    let flag = true;
    files.some((val,index,files)=>{
      if(uid == val.uid){
        flag = false;
        return true;
      }
    })
    if(flag){
      const obj = { uid: uid, status: 1 }
      files.push(obj)
      this.setState({
        files: files
      })
    }
  }
  delFiles = (file) => {
    let { files } = this.state
    const uid = file.response.uid;

    files.some((val,index,arr)=>{
      if(uid == val.uid){
        files.splice(index,1);
        files.push({
          uid: uid,
          status: 0
        })
        this.setState({
          files: files
        })
        return true
      }
    })
  }
  render() {
    const { infoId } = this.props
    const that = this;
    const params = {
      accept:'.pdf,.bmp,.jpg,.png,.gif',
      action: '/api/reportInfo/upload?infoId='+ infoId,
      onChange({file,list}){
        if (file.status !== 'uploading') {
          that.addFiles(file)
        }
      },
      onRemove(file){
        that.delFiles(file)
      },
      onPreview(file){
        window.location.href = file.response.url
      }
    }
    return (
      <Upload {...params}>
        <Button>
          <Icon type="upload" /> 新增合同文件
        </Button>
      </Upload>
    )

  }
}
class OldUpload extends PureComponent{
  render() {
    const { files,downFiles } = this.props
    const params = {
      fileList: files,
      disabled: true,
      /*onPreview(file){
        downFiles(file.uid,file.name)
      }*/
    }
    return (
      <Upload {...params} >
        <Divider type="vertical" />
        现有合同文件
        <Divider type="vertical" />
      </Upload>
    )

  }
}
export default ContractList;

