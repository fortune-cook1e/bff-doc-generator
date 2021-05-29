import { GetControllerInfoResponse, GetApiInfoResponse, GetAstMethodParamsResponse, TransformAstMethodItemResponse } from './types';
export declare type AnyOptions = {
    [propname: string]: any;
};
export declare function runString(code: string, controllerFilePath: string): Promise<AnyOptions>;
/**
 * @description 获取controller基本信息
 * @param {AnyOptions} ast
 * @param {string} filename
 * @date 2021-05-20 22:01:41
 * @return {GetControllerInfoResponse}
 */
export declare function getControllerInfo(ast: AnyOptions, filename: string): Promise<GetControllerInfoResponse>;
/**
 * @description 获取ast方法节点
 * @param {any} ast
 * @date 2021-05-15 18:52:14
 * @return {*}
 */
export declare function getAstApis(ast: AnyOptions, controllerFilePath: string): Promise<TransformAstMethodItemResponse[]>;
/**
 * @description 转换ast method类型节点
 * @param {*}
 * @date 2021-05-20 23:32:44
 * @return {*}
 */
export declare function transformAstMethodItem(astMethodItem: AnyOptions, controllerFilePath: string): TransformAstMethodItemResponse;
/**
 * @description 获取单个api的 函数名称、路由地址、请求方法
 * @param {AnyOptions} methodAst
 * @date 2021-05-20 22:42:16
 * @return {GetApiInfoResponse}
 */
export declare function getApiInfo(methodAst: AnyOptions): GetApiInfoResponse;
/**
 * @description 获取函数参数
 * @param {AnyOptions} methodParams
 * @date 2021-05-16 17:29:39
 * @return {*}
 */
export declare function getAstMethodParams(methodParams?: any[]): GetAstMethodParamsResponse[];
/**
 * @description 获取ast 函数注释
 * @param {any} ast
 * @date 2021-05-15 19:23:12
 * @return {string[]}
 */
export declare function getAstComments(ast: AnyOptions): Promise<string[]>;
