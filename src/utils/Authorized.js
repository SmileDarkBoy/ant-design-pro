import RenderAuthorized from '@/components/Authorized';
import { getAuthority } from './authority';

let Authorized = RenderAuthorized(getAuthority());
function reloadAuthorized(str){

  Authorized = RenderAuthorized(getAuthority(str));

};

export { reloadAuthorized };
export default Authorized;


