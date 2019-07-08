import request from '@/utils/request';

export function getAuthority(str) {
  return [str]
 /* const result = await request(`/business-analysis-web/api/user/getCurrentUser`);
  let currentAuthority = undefined;
  if(result !== undefined){
    const currentUser = result.currentAuthority;
    const authorityString = typeof str === 'undefined' ? currentUser : str;

    let authority;
    try {
      authority = JSON.parse(authorityString);
    } catch (e) {
      authority = authorityString;
    }
    if (typeof authority === 'string') {
      currentAuthority = [authority];
    }else{
      currentAuthority = authority || ['guest'];
    }
  }else{
    currentAuthority = ['guest'];
  }
  return currentAuthority;*/
}

export function setAuthority(currentUser) {
  //登录成功+登出时 设置权限
  request('/business-analysis-webfd/api/user/setCurrentUser',{
    method: 'POST',
    body: currentUser
  })
}
