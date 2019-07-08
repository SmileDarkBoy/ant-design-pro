import { getData, getSelectTreeData, saveData, updateData, delData, getLastDictData, checkDictData, getCurrentUser, } from '@/services/api';
import { routerRedux } from 'dva/router';
import { stringify } from 'qs';

export default {
  namespace: 'dictDataRule',

  state: { //前端能取到的数据
    data: {
      list: [],
      //pagination: {},
    },
    selectTreeData: []
  },

  effects: {
    *datalist({ payload, callback }, { call, put }) {
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
      const response = yield call(getData, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *getSelectTreeData({ payload }, { call, put }){
      const response = yield call(getSelectTreeData, payload);
      yield put({
        type: 'getSelectTree',
        payload: response,
      });
    },
    *saveDictData({ payload }, { call, put }){
      const response = yield call(saveData, payload);
      payload.resolve(response);
    },
    *updateDictData({ payload }, { call, put }){
      const response = yield call(updateData, payload);
      payload.resolve(response);
    },
    *delDictData({ payload }, { call, put }){
      const response = yield call(delData, {dictCode : payload.dictCode});
      payload.resolve(response);
    },
    *checkData({ payload, callback }, { call, put }) {
      const response = yield call(checkDictData, payload);
      payload.resolve(response);
    },
    *lastDictDataObj({ payload, callback }, { call, put }){
      const response = yield call(getLastDictData, payload);
      yield put({
        type: 'setLastData',
        payload: response,
      });
    }
  },

  reducers: {
    save(state, action) {
      const request = {
        list: action.payload,
        //total: action.payload.length
      };
      return {
        ...state,
        data: request
      };
    },
    getSelectTree(state,action){
      return {
        ...state,
        selectTreeData: action.payload
      }
    },
    setLastData(state, action){
      return {
        ...state,
        lastDataObj: action.payload
      }
    }
  },
};
