import request from '@/utils/request';

export async function queryProvince() {
  return request('/business-analysis-webfd/api/geographic/province');
}

export async function queryCity(province) {
  return request(`/business-analysis-webfd/api/geographic/city/${province}`);
}
