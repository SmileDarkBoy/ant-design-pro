import request from '@/utils/request';

export async function query() {
  return request('/business-analysis-webfd/api/users');
}

export async function queryCurrent() {
  return request('/business-analysis-webfd/api/currentUser');
}
