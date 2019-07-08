import { stringify } from 'qs';
import request from '@/utils/request';

//-----------------
//user

export async function updatePassword(params) {
  return request('/business-analysis-webfd/api/user/updatePassword',{
    method: 'POST',
    body: params
  })
}

export async function accountLogin(params) {
  return request('/business-analysis-webfd/api/user/login',{
    method: 'POST',
    body: params
  })
}
export async function getUserDict(params) {
  return request(`/business-analysis-webfd/api/user/getUserDict`,{
    method: 'POST',
    body: params
  });
}
export async function getDeptSelectTree(params) {
  return request(`/business-analysis-webfd/api/user/getDeptSelectTree`);
}
export async function getUserSelectTree(params) {
  return request(`/business-analysis-webfd/api/user/getUserSelectTree`);
}
export async function getCurrentUser(params) {
  return request(`/business-analysis-webfd/api/user/getCurrentUser`)
}


//dictType
export async function getDictType(params) {
  return request(`/business-analysis-webfd/api/dict/getType?${stringify(params)}`);
}
export async function addDictType(params) {
  return request('/business-analysis-webfd/api/dict/addType',{
    method: 'POST',
    body: params
  })
}
export async function updateDictType(params) {
  return request('/business-analysis-webfd/api/dict/updateType',{
    method: 'POST',
    body: params
  })
}
export async function delDictType(params) {
  return request('/business-analysis-webfd/api/dict/delType',{
    method: 'POST',
    body: params
  });
}
export async function checkDictType(params) {
  return request(`/business-analysis-webfd/api/dict/checkType?${stringify(params)}`)
}

//dictData
export async function getData(params) {
  return request(`/business-analysis-webfd/api/dict/getData?${stringify(params)}`)
}
export async function getSelectTreeData(params) {
  return request(`/business-analysis-webfd/api/dict/getSelectTreeData?${stringify(params)}`);
}
export async function getSelectTreeDataCopy(params) {
  return request(`/business-analysis-webfd/api/dict/getSelectTreeDataCopy?${stringify(params)}`);
}
export async function saveData(params) {
  return request(`/business-analysis-webfd/api/dict/saveData`,{
    method: 'POST',
    body: params
  });
}
export async function updateData(params) {
  return request(`/business-analysis-webfd/api/dict/updateData`,{
    method: 'POST',
    body: params
  });
}
export async function delData(params) {
  return request('/business-analysis-webfd/api/dict/delData',{
    method: 'POST',
    body: params
  });
}
export async function checkDictData(params) {
  return request(`/business-analysis-webfd/api/dict/checkData?${stringify(params)}`)
}
export async function getLastDictData(params) {
  return request(`/business-analysis-webfd/api/dict/getLastData?${stringify(params)}`);
}

//info
export async function getDataByTypes(params) {
  return request(`/business-analysis-webfd/api/dict/getDataByTypes?${stringify(params)}`);
}
export async function listInfodata(params) {
  return request(`/business-analysis-webfd/api/reportInfo/list`,{
    method: 'POST',
    body: params
  });
}
export async function getInfo(params) {
  return request(`/business-analysis-webfd/api/reportInfo/getInfo?${stringify(params)}`);
}
export async function saveFormList(params) {
  return request(`/business-analysis-webfd/api/reportInfo/saveFormList`,{
    method: 'POST',
    body: params
  });
}
export async function removeInfo(params) {
  return request(`/business-analysis-webfd/api/reportInfo/removeInfo?${stringify(params)}`);
}
export async function save(params) {
  return request(`/business-analysis-webfd/api/reportInfo/save`,{
    method: 'POST',
    body: params
  });
}

export async function isOnlyXmba(params) {
  return request(`/business-analysis-webfd/api/reportInfo/isOnlyXmba`,{
    method: 'POST',
    body: params
  });
}
export async function getAreaTreeData(params) {
  return request(`/business-analysis-webfd/api/reportInfo/getAreaTreeData?${stringify(params)}`)
}
export async function updateXmztApi(params) {
  return request(`/business-analysis-webfd/api/reportInfo/updateXmzt`,{
    method: 'POST',
    body: params
  });
}
export async function updateApi(params) {
  return request(`/business-analysis-webfd/api/reportInfo/update`,{
    method: 'POST',
    body: params
  });
}

//contract
export async function contractList(params) {
  return request(`/business-analysis-webfd/api/reportInfo/contract`,{
    method: 'POST',
    body: params
  });
}
export async function getContract(params) {
  return request(`/business-analysis-webfd/api/reportInfo/getContract?${stringify(params)}`);
}
export async function saveContract(params) {
  return request(`/business-analysis-webfd/api/reportInfo/saveContract`,{
    method: 'POST',
    body: params
  });
}
export async function getFileUpload(params) {
  return request(`/business-analysis-webfd/api/reportInfo/getFileUpload?${stringify(params)}`);
}
export async function download(params) {
  return request(`/business-analysis-webfd/api/reportInfo/download?${stringify(params)}`);
}

