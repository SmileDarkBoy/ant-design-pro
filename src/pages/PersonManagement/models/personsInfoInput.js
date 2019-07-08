import { queryPersonsInfoList, addPersonsInfo, updatePersonsInfo, removeByIds,queryDeptList } from '@/services/personInfoList';
import { getCurrentUser } from '@/services/api';
import { routerRedux } from 'dva/router';
import { stringify } from 'qs';

export default {
  namespace: 'PersonInfo',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    PersonData: {
      list: [],
      pagination: {},
    },
    DeptData: {},
  },

  effects: {
    * fetch({ payload }, { call, put }) {
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
      const response = yield call(queryPersonsInfoList, payload);
      // payload.resolve(response);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    * add({ payload }, { call, put }) {
      const response = yield call(addPersonsInfo, payload);
      // payload.resolve(response);
      // yield put({
      //   type: 'save',
      //   payload: response,
      // });
    },
    * update({ payload, callback }, { call, put }) {
      const response = yield call(updatePersonsInfo, payload);
      payload.resolve(response);
      // yield put({
      //   type: 'save',
      //   payload: response,
      // });
      // if (callback) callback();
    },
    * remove({ payload, callback }, { call, put }) {
      const response = yield call(removeByIds, payload);
      payload.resolve(response);
      // yield put({
      //   type: 'save',
      //   payload: response,
      // });
      // if (callback) callback();
    },
    * fetchDeptData({ payload }, { call, put }) {
      const response = yield call(queryDeptList, payload);
      yield put({
        type: 'DeptData',
        payload: response,
      });
    },
  },

  reducers: {
    // save(state, action) {
    //   return {
    //     ...state,
    //     data: action.payload,
    //   };
    // },
    save(state, action) {
      const request = {
        list: action.payload,
        total: action.length,
      };
      return {
        ...state,
        PersonData: request,
      };
    },
    DeptData(state, action) {
      return {
        ...state,
        DeptData: action.payload,
      };
    },
  },
};
