import { stringify } from 'qs';
import request from '@/utils/request';

export async function queryProjectNotice() {
  return request('/business-analysis-webfd/api/project/notice');
}

export async function queryActivities() {
  return request('/business-analysis-webfd/api/activities');
}

export async function queryPersonsInfoList(params) {
  console.log(params, 'params');
  return request(`/business-analysis-webfd/api/Persons?${stringify(params)}`);
  //return request(`/dataList/rule?${stringify(params)}`);
}

export async function addPersonsInfo(params) {
  return request('/business-analysis-webfd/api/Persons/save', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function updatePersonsInfo(params) {
  return request('/business-analysis-webfd/api/Persons/update', {
    method: 'POST',
    body: {
      ...params,
    },
  });
  // return null;
}

export async function removeByIds(params) {
  return request(`/business-analysis-webfd/api/Persons?ids=${params.ids}`, {
    method: 'DELETE',
  });
}

export async function querydeptData() {

  return request(`/business-analysis-webfd/api/Product/deptList`);
  //return request(`/dataList/rule?${stringify(params)}`);
}

export async function querybusinessData(params) {
  return request(`/business-analysis-webfd/api/Cat?${stringify(params)}`);
  //return request(`/dataList/rule?${stringify(params)}`);
}

export async function queryDeptList(params) {

  return request(`/business-analysis-webfd/api/Dept?${stringify(params)}`);
  //return request(`/dataList/rule?${stringify(params)}`);
}

export async function fakeSubmitForm(params) {
  return request('/business-analysis-webfd/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/business-analysis-webfd/api/fake_chart_data');
}

export async function queryTags() {
  return request('/business-analysis-webfd/api/tags');
}

export async function queryBasicProfile() {
  return request('/business-analysis-webfd/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/business-analysis-webfd/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/business-analysis-webfd/api/fake_list?${stringify(params)}`);
}

export async function removeFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/business-analysis-webfd/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'delete',
    },
  });
}

export async function addFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/business-analysis-webfd/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'post',
    },
  });
}

export async function updateFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/business-analysis-webfd/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'update',
    },
  });
}

export async function fakeAccountLogin(params) {
  return request('/business-analysis-webfd/api/login/account', {
    method: 'POST',
    body: params,
  });
}

export async function fakeRegister(params) {
  return request('/business-analysis-webfd/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request('/business-analysis-webfd/api/notices');
}

export async function getFakeCaptcha(mobile) {
  return request(`/business-analysis-webfd/api/captcha?mobile=${mobile}`);
}
