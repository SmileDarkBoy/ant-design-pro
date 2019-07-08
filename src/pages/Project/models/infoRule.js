import { getDataByTypes, getInfo, listInfodata, saveFormList, removeInfo, getAreaTreeData,updateXmztApi,getCurrentUser,
         getUserDict, getSelectTreeDataCopy, getDeptSelectTree, getUserSelectTree, save, updateApi,updatePassword,isOnlyXmba } from '@/services/api';
import { routerRedux } from 'dva/router';
import { stringify } from 'qs';

export default {
  namespace: 'infoRule',

  state: { //前端能取到的数据
    data: {
      list: [],
      pagination: {},
    },
    info:{},
    defaultVal: {
      //初始化时获取
      dictTypes: {}, //字典值
      businessType: [], //select
      projectType: [],  //select
      deptSelectTree:[],//treeSelect
      userSelectTree:[],//treeSelect
      areaSelectTree:[],//treeSelect
      citySelectTree:[],
      currentUser: undefined
    },
    userDict:{}
  },

  effects: {

    *updatePassword({ payload }, { call }){
      console.log("payload ： ",payload)
     const response = yield call(updatePassword,payload)
      payload.resolve(response);
    },

    *getList({ payload }, { call, put }){
      const response = yield call(listInfodata, payload);
      yield put({
        type: 'setList',
        payload: response,
      });
    },
    *getInf({ payload }, { call, put }){
      const response = yield call(getInfo, payload);
      yield put({
        type: 'setInfo',
        payload: response,
      });
    },
    *getComponents({ payload }, { call, put }){
      const dictTypes = yield call(getDataByTypes, payload.dictTypeParams);
      const businessType = yield call(getSelectTreeDataCopy, payload.businessType);
      const projectType = yield call(getSelectTreeDataCopy, payload.projectType);
      const deptSelectTree = yield call(getDeptSelectTree, {});
      const userSelectTree = yield call(getUserSelectTree, {});
      const areaSelectTree = yield call(getAreaTreeData, {});
      const citySelectTree = yield call(getAreaTreeData, payload.citySelectTree);
      const currentUser = yield call(getCurrentUser,{});
      if(currentUser === undefined || currentUser.currentAuthority === 'guest'){
        yield put(
          routerRedux.push({
            pathname: '/user/login',
            search: stringify({
              redirect: window.location.href,
            }),
          })
        )
      }
      const defaultVal = {
        dictTypes: dictTypes,
        businessType: businessType,
        projectType: projectType,
        deptSelectTree: deptSelectTree,
        userSelectTree: userSelectTree,
        areaSelectTree: areaSelectTree,
        citySelectTree: citySelectTree,
        currentUser: currentUser
      };
      yield put({
        type: 'setComponents',
        payload: defaultVal,
      });

    },
    *getUserDict({ payload }, { call, put }){
      const userDict = yield call(getUserDict, {});
      yield put({
        type: 'setUserDict',
        payload: userDict,
      });
    },

    *saveAddForm({ payload }, { call, put }) {
      const response = yield call(save, payload);
      payload.resolve(response);
    },

    *isOnlyXmba({ payload }, { call, put }) {
      const response = yield call(isOnlyXmba, payload);
      payload.resolve(response);
    },

    *update({ payload }, { call, put }) {
      const response = yield call(updateApi, payload);
      payload.resolve(response);
    },
    *remove({ payload }, { call, put }){
      const response = yield call(removeInfo, payload);
      payload.resolve(response);
    },
    *saveUpForm({ payload }, { call, put }){
      const response = yield call(saveFormList, payload);
      payload.resolve(response);
    },
    *updateXmzt({ payload }, { call, put }) {
      const response = yield call(updateXmztApi, payload);
      payload.resolve(response);
    },

  },

  reducers: {
    setList(state, action) {
      const request = {
        list: action.payload,
        total: action.payload.length
      };
      return {
        ...state,
        data: request
      };
    },
    setInfo(state,action){
      return {
        ...state,
        info: action.payload
      }
    },
    setComponents(state,action){
      return {
        ...state,
        defaultVal: action.payload
      }
    },
    setUserDict(state,action){
      return {
        ...state,
        userDict: action.payload
      }
    }
  }
};
