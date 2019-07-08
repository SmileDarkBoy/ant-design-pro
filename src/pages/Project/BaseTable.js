import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Input, message, Popconfirm, Divider } from 'antd';
import isEqual from 'lodash/isEqual';

class TableForm extends PureComponent {
  index = 0;
  cacheOriginData = {};

  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      loading: false
    };
  }

  static getDerivedStateFromProps(nextProps, preState) {
    if (isEqual(nextProps.value, preState.value)) {
      return null;
    }
    return {
      data: nextProps.value,
      value: nextProps.value,
    };
  }

  getRowByKey(key, newData) {
    const { data } = this.state;
    return (newData || data).filter(item => (item.key == undefined ? item.id : item.key) === key)[0];
  }

  handleFieldChange(e, fieldName, key) {
    const { data } = this.state;
    const newData = data.map(item => {
      return ({
        ...item
      })
    });
    const target = this.getRowByKey(key, newData);
    if(e != null){
      if(e.target == undefined){
        target[fieldName] = e;
      }else{
        target[fieldName] = e.target.value;
      }
    }
    this.setState({ data: newData });
  }

  toggleEditable = (e, key) => {
    e.preventDefault();
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = { ...target };
      }
      target.editable = !target.editable;
      this.setState({ data: newData });
    }
  };

  cancel(e, key) {
    this.clickedCancel = true;
    e.preventDefault();
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      delete this.cacheOriginData[key];
    }
    target.editable = false;
    this.setState({ data: newData });
    this.clickedCancel = false;
  }

  remove(key) {
    const { data } = this.state;
    const { onChange } = this.props;
    const newData = data.filter(item => (item.key == undefined ? item.id : item.key) !== key);
    this.setState({ data: newData });
    onChange(newData);
  }

  saveRow(e, key) {
    e.persist();
    this.setState({
      loading: true,
    });
    setTimeout(() => {
      if (this.clickedCancel) {
        this.clickedCancel = false;
        return;
      }
      const target = this.getRowByKey(key) || {};
      if(!this.check(e, target))
        return;
      delete target.isNew;
      this.toggleEditable(e, key);
      const { data } = this.state;
      const { onChange } = this.props;
      onChange(data);
      this.setState({
        loading: false,
      });
    }, 500);
  }

  check(e, target){

  }

  newMember = () => {
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));

    const defaultValues = this.getDefaultValues();
    newData.unshift({
      key: `NEW_TEMP_ID_${this.index}`,
      ...defaultValues,
      editable: true,
      isNew: true
    });
    this.index += 1;
    this.setState({ data: newData });
  };

  render() {

  }
}

export default TableForm;
