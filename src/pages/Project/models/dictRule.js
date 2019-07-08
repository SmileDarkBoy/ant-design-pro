import { getDictType, addDictType, updateDictType, checkDictType, delDictType, getCurrentUser } from '@/services/api';
import { routerRedux } from 'dva/router';
import { stringify } from 'qs';

export default {
  namespace: 'dictRule',
  state: { //前端能取到的数据
    data: {
      list: [],
      pagination: {},
    },
    lastDataObj: {}
  },
  effects: {
    *listData({ payload }, { call, put }){
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
      const response = yield call(getDictType, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addDictType, payload);
      payload.resolve(response);
    },
    *update({ payload, callback }, { call, put }) {
      const response = yield call(updateDictType, payload);
      payload.resolve(response);
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(delDictType, {id : payload.id});
      payload.resolve(response);
    },
    *checkType({ payload, callback }, { call, put }) {
      const response = yield call(checkDictType, payload);
      payload.resolve(response);
    },
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
    }
  },
};
