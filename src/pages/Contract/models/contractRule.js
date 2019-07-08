import { getDataByTypes, contractList, getUserDict, getContract, saveContract, getFileUpload, download, getCurrentUser} from '@/services/api';
import { routerRedux } from 'dva/router';
import { stringify } from 'qs';

export default {
  namespace: 'contractRule',
  state: {
    data: {
      list: [],
      pagination: {},
    },
    dictTypes: {},
    userDict:{},
    contract: {},
    files: [],
    currentUser: undefined
  },

  effects: {
    *getList({ payload }, { call, put }){
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
      const response = yield call(contractList, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *getDictDataByTypes({ payload }, { call, put }){
      const response = yield call(getDataByTypes, payload);
      yield put({
        type: 'getDictData',
        payload: response,
      });
    },
    *getUserDicts({ payload }, { call, put }){
      const response = yield call(getUserDict, payload);
      yield put({
        type: 'setUserDict',
        payload: response,
      });
    },
    *getRecord({ payload }, { call, put }){
      const response = yield call(getContract, payload);
      yield put({
        type: 'setContract',
        payload: response,
      });
    },
    *saveForm({ payload }, { call, put }){
      const response = yield call(saveContract, payload);
      payload.resolve(response);
    },
    *getFileUpload({ payload }, { call, put }){
      const response = yield call(getFileUpload, payload);
      yield put({
        type: 'setFiles',
        payload: response,
      });
    },
    *download({ payload }, { call, put }){
      const response = yield call(download, payload);
    },
    *getUser({ payload }, { call, put }){
      const currentUser = yield call(getCurrentUser,{});
      yield put({
        type: 'setUser',
        payload: currentUser,
      });
    }
  },
  reducers: {
    save(state, action) {
      const request = {
        list: action.payload,
        total: action.payload.length
      };
      return {
        ...state,
        data: request
      };
    },
    getDictData(state,action){
      return {
        ...state,
        dictTypes: action.payload
      }
    },
    setUserDict(state,action){
      return {
        ...state,
        userDict: action.payload
      }
    },
    setContract(state, action){
      return {
        ...state,
        contract: action.payload
      }
    },
    setFiles(state, action){
      return {
        ...state,
        files: action.payload
      }
    },
    setUser(state, action){
      return {
        ...state,
        currentUser:action.payload
      }
    },
  },
};
