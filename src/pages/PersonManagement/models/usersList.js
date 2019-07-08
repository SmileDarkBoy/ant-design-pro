import { queryUsersList ,queryDeptList} from '@/services/usersList';
import { getCurrentUser} from '@/services/api';

import { routerRedux } from 'dva/router';
import { stringify } from 'qs';

export default {
  namespace: 'UsersInfo',

  state: {
    Data: {
      list: [],
      pagination: {},
    },
    UserDatas: {
      list: [],
      pagination: {},
    },
    DeptData:{}
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
      const response = yield call(queryUsersList, payload);
      // payload.resolve(response);
      yield put({
        type: 'save',
        payload: response,
      });
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
        UserDatas: request,
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
