export interface GetControllerInfoResponse {
    controllerName: string;
    apiPrefix: string;
}
export declare type AjaxMethod = 'Get' | 'GET' | 'Post' | 'POST';
export interface GetApiInfoResponse {
    name: string;
    route: string;
    description: string;
    ajaxMethod: AjaxMethod;
}
export interface GetAstMethodParamsResponse {
    name: string;
    type: string;
    description: string;
    isRequired: boolean;
}
export interface MethodParamItem {
    name: string;
    type: string;
    description: string;
    isRequired: boolean;
}
export interface TransformAstMethodItemResponse {
    name: string;
    route: string;
    description: string;
    ajaxMethod: string;
    params: MethodParamItem[];
    snippets: string;
}
export interface CommentItem {
    description: string;
    name: string;
    params: CommentParamItem[];
}
export interface CommentParamItem {
    key: string;
    description: string;
}
declare const STRING_TYPE = "TSStringKeyword";
export declare type MethodParamType = typeof STRING_TYPE;
export {};
