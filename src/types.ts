
export interface GetControllerInfoResponse {
  controllerName:string;   // controller 名称
  apiPrefix:string;        // api前缀
}

export type AjaxMethod = 'Get' | 'GET' | 'Post' | 'POST'

export interface GetApiInfoResponse {
  name:string;         // api 名称
  route:string;        // api 路由
  description:string;  // api 描述
  ajaxMethod:AjaxMethod;   // api 请求方法
}

export interface GetAstMethodParamsResponse {
  name:string;           // 参数名称
  type:string;           // 参数类型
  description:string;    // 参数描述
  isRequired:boolean;    // 参数是否必须
}

export interface MethodParamItem {
  name:string;         // 参数名称
  type:string;         // 参数类型
  description:string;  // 参数描述
  isRequired:boolean;  // 是否必须
}

export interface TransformAstMethodItemResponse {
  name:string;                // api名称
  route:string;               // api路由
  description:string;         // api注释
  ajaxMethod:string;          // api方法
  params:MethodParamItem[];   // api参数
  snippets:string;            // 代码片
}

export interface CommentItem {
  description:string;         // 当前函数描述
  name:string;                // 注释对应api名称
  params:CommentParamItem[];  // 函数每个参数注释
}

export interface CommentParamItem {
  key:string;
  description:string;
}

const STRING_TYPE = 'TSStringKeyword' // string类型节点

export type MethodParamType = typeof STRING_TYPE
