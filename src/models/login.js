import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import { accountLogin, getFakeCaptcha } from '@/services/api';
import { setAuthority, getAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { reloadAuthorized } from '@/utils/Authorized';
import { message } from 'antd';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(accountLogin, payload);
      yield put({ type: 'changeLoginStatus', payload: response });
      if(response.status === 'error'){
        message.error(response.type);
      }
      if (response.status === 'ok') {
        reloadAuthorized('user');
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params;
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.startsWith('/#')) {
              redirect = redirect.substr(2);
            }
          } else {
            window.location.href = redirect;
            return;
          }
        }
        yield put(routerRedux.replace(redirect || '/'));
      }
    },

    *getCaptcha({ payload }, { call }) {
      yield call(getFakeCaptcha, payload);
    },

    *logout(_, { put }) {
      yield put({ type: 'changeLoginStatus', payload: {
          currentUser: {
            currentAuthority: 'guest'
          }
        }
      });
      //reloadAuthorized('guest');
      yield put(
        routerRedux.push({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        })
      );
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentUser);
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },
};
