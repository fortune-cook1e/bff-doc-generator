"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAstComments = exports.getAstMethodParams = exports.getApiInfo = exports.transformAstMethodItem = exports.getAstApis = exports.getControllerInfo = exports.runString = void 0;
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const snippets_1 = require("./snippets");
const util_1 = require("./util");
const { parse } = require('@typescript-eslint/typescript-estree');
const AJAX_METHODS = ['Get', 'GET', 'Post', 'POST'];
function runString(code, controllerFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const filename = path.basename(controllerFilePath, '.ts').toLowerCase();
            const astOptions = {
                comment: true,
                loc: true,
                filePath: controllerFilePath,
                tokens: false,
                range: false,
                errorOnUnknownASTType: false,
                jsx: false,
                useJSXTextNode: false,
            };
            const ast = parse(code, astOptions);
            const [controllerInfo, apis, comments] = yield Promise.all([
                getControllerInfo(ast, filename),
                getAstApis(ast, controllerFilePath),
                getAstComments(ast),
            ]);
            const { controllerName = '', apiPrefix = '' } = controllerInfo;
            const combinedApis = combineCommentsAndApis(apis, comments);
            const fileData = fs.readFileSync(controllerFilePath, 'utf-8');
            const data = {
                controllerName,
                apiPrefix,
                apis: combinedApis,
                snippets: fileData
            };
            // const dir = process.cwd() + '/src/doc'
            // fs.writeJSONSync(`${dir}/${filename}-.json`, data, {
            //   encoding: 'utf-8',
            //   spaces: 1
            // })
            // fs.writeJSONSync(`${dir}/${filename}-ast.json`, ast, {
            //   encoding: 'utf-8',
            //   spaces: 1
            // })
            return data;
        }
        catch (e) {
            console.log(e);
        }
    });
}
exports.runString = runString;
/**
 * @description 获取controller基本信息
 * @param {AnyOptions} ast
 * @param {string} filename
 * @date 2021-05-20 22:01:41
 * @return {GetControllerInfoResponse}
 */
function getControllerInfo(ast, filename) {
    return new Promise((resolve, reject) => {
        var _a;
        try {
            const classDecAstNode = ast.body.find((node) => node.type === 'ExportDefaultDeclaration');
            const decorators = (_a = classDecAstNode === null || classDecAstNode === void 0 ? void 0 : classDecAstNode.declaration) === null || _a === void 0 ? void 0 : _a.decorators;
            // 找到jsonController装饰器 然后获取对应的value值 拿到api前缀
            const jsonControllerNode = decorators.find((item) => { var _a, _b; return ((_b = (_a = item === null || item === void 0 ? void 0 : item.expression) === null || _a === void 0 ? void 0 : _a.callee) === null || _b === void 0 ? void 0 : _b.name) === 'JsonController'; });
            resolve({
                controllerName: filename,
                apiPrefix: jsonControllerNode.expression.arguments[0].value
            });
        }
        catch (e) {
            console.log(e);
            reject({
                controllerName: filename,
                apiPrefix: ''
            });
        }
    });
}
exports.getControllerInfo = getControllerInfo;
/**
 * @description 获取ast方法节点
 * @param {any} ast
 * @date 2021-05-15 18:52:14
 * @return {*}
 */
function getAstApis(ast, controllerFilePath) {
    // let methods:AnyOptions[] = []
    return new Promise((resolve, reject) => {
        try {
            const classDecAstNode = ast.body.find((node) => node.type === 'ExportDefaultDeclaration');
            // 只保留 MethodDefinition 类型
            const methodsNodes = classDecAstNode.declaration.body.body.filter((node) => node.type === 'MethodDefinition');
            const apis = methodsNodes.reduce((apiList, methodItem) => {
                try {
                    const item = transformAstMethodItem(methodItem, controllerFilePath);
                    apiList.push(item);
                    return apiList;
                }
                catch (e) {
                    console.error(chalk.red(e.message));
                    console.log(apiList, controllerFilePath);
                }
            }, []);
            resolve(apis);
        }
        catch (e) {
            console.log('getAstApis error', e.message);
            reject([]);
        }
    });
}
exports.getAstApis = getAstApis;
/**
 * @description 转换ast method类型节点
 * @param {*}
 * @date 2021-05-20 23:32:44
 * @return {*}
 */
function transformAstMethodItem(astMethodItem, controllerFilePath) {
    const { name = '', route = '', description = '', ajaxMethod = '' } = getApiInfo(astMethodItem);
    const params = getAstMethodParams(astMethodItem.value.params);
    const loc = {
        start: astMethodItem.loc.start.line,
        end: astMethodItem.loc.end.line
    };
    // TODO: 暂时屏蔽根据readline获取代码片功能 因为会出现没有获取完的情况
    // const snippetData = await getSnippets(loc.start, loc.end, controllerFilePath)
    const snippetData = snippets_1.getSnippetsByFile(loc.start, loc.end, controllerFilePath);
    return {
        name,
        route,
        description,
        ajaxMethod,
        params,
        snippets: snippetData
    };
}
exports.transformAstMethodItem = transformAstMethodItem;
/**
 * @description 获取单个api的 函数名称、路由地址、请求方法
 * @param {AnyOptions} methodAst
 * @date 2021-05-20 22:42:16
 * @return {GetApiInfoResponse}
 */
function getApiInfo(methodAst) {
    const { key: { name = '' } } = methodAst;
    const ajaxDecoratorItem = methodAst.decorators.find((item) => AJAX_METHODS.includes(item.expression.callee.name)) || {};
    const { expression: { callee: { name: ajaxMethod = '' }, arguments: decoratorItemArguments = [] } } = ajaxDecoratorItem;
    const route = decoratorItemArguments[0].value || '';
    return {
        name,
        route,
        description: '',
        ajaxMethod
    };
}
exports.getApiInfo = getApiInfo;
/**
 * @description 获取函数参数
 * @param {AnyOptions} methodParams
 * @date 2021-05-16 17:29:39
 * @return {*}
 */
function getAstMethodParams(methodParams = []) {
    return methodParams.reduce((params, paramItem) => {
        try {
            if (paramItem.type === 'Identifier') {
                const { name = '', typeAnnotation = '' } = paramItem;
                const paramTsType = util_1.decideTsType(typeAnnotation);
                // optional 为true 那么参数为非必填
                const isRequired = !(paramItem === null || paramItem === void 0 ? void 0 : paramItem.optional);
                params.push({
                    name,
                    type: paramTsType,
                    description: '',
                    isRequired: isRequired
                });
            }
            return params;
        }
        catch (e) {
            console.error(chalk.red(e.message));
            console.log(paramItem);
        }
    }, []);
}
exports.getAstMethodParams = getAstMethodParams;
/**
 * @description 获取ast 函数注释
 * @param {any} ast
 * @date 2021-05-15 19:23:12
 * @return {string[]}
 */
// 获取的数据格式为
// const comment = {
// 	description:'',   // 当前函数描述
// 	name:'',          // 当前函数名称
// 	params:[          // 函数参数
// 		{
// 			key:'',       // 参数名称
// 			description:''      // 参数对应注释
// 		}
// 	]
// }
function getAstComments(ast) {
    let comments = [];
    return new Promise((resolve, reject) => {
        try {
            comments = ast.comments.reduce((array, comment) => {
                const commentItem = {
                    description: '',
                    name: '',
                    params: []
                };
                if (comment.type === 'Block') {
                    const transFormedValue = getTransformedComment(comment.value);
                    commentItem.description = getCommentDescription(transFormedValue);
                    commentItem.name = getCommentName(transFormedValue);
                    commentItem.params = getCommentParams(transFormedValue);
                }
                array.push(commentItem);
                return array;
            }, []);
            resolve(comments);
        }
        catch (e) {
            console.log(e);
            reject(comments);
        }
    });
}
exports.getAstComments = getAstComments;
/**
 * @description 将单个comment 转换为每项为`@`开头的数组。例如 '@description' xxx
 * @param {AnyOptions} comment
 * @date 2021-05-24 21:08:58
 * @return {AnyOptions[]}
 */
function getTransformedComment(comment) {
    return comment.replace(/\n/g, '').split('*').filter((item) => item.includes('@')).map((item) => item.trim());
}
/**
 * @description 获取单个comment的description
 * @param {*} commentArray
 * @date 2021-05-24 21:10:24
 * @return {string}
 */
function getCommentDescription(commentItem) {
    const descriptionSymbol = '@description';
    const descriptionItem = commentItem.find((item) => item.includes(descriptionSymbol));
    if (!descriptionItem)
        return '';
    return descriptionItem.slice(descriptionSymbol.length) || '';
}
/**
 * @description 获取单个comment的name字段
 * @param {*} commentArray
 * @date 2021-05-24 21:14:54
 * @return {string}
 */
function getCommentName(commentItem) {
    const nameSymbol = '@name';
    const nameItem = commentItem.find((item) => item.includes(nameSymbol));
    if (!nameItem)
        return '';
    return nameItem.slice(nameSymbol.length).trim() || '';
}
/**
 * @description 获取函数每个参数以及参数注释
 * @param {*} commentItem
 * @date 2021-05-25 21:12:29
 */
function getCommentParams(commentItem) {
    const paramSymbol = '@param';
    const paramList = commentItem.filter((item) => item.includes(paramSymbol));
    if (!paramList.length)
        return [];
    const params = paramList.reduce((list, item) => {
        const paramItem = {
            key: '',
            description: ''
        };
        // 每个item形式为 @param metadata metadat awowo dsads
        const firstSpaceIndex = item.indexOf(' ');
        const inexistence = -1;
        // 先拿到第一个空格值,再拿第二个空格
        // 第一个空格与第二个空格之间为 参数值
        // 第二个空格之后为参数的注释
        if (firstSpaceIndex !== inexistence) {
            const secondSpaceIndex = item.indexOf(' ', firstSpaceIndex + 1);
            if (secondSpaceIndex !== inexistence) {
                paramItem.key = item.slice(firstSpaceIndex, secondSpaceIndex).trim();
                paramItem.description = item.slice(secondSpaceIndex).trim();
            }
        }
        list.push(paramItem);
        return list;
    }, []);
    return params;
}
/**
 * @description 合并转换后的apis和comments字段
 * @param {*} apis
 * @param {*} comments
 * @date 2021-05-25 21:38:52
 */
function combineCommentsAndApis(apis, comments) {
    if (!apis.length)
        return [];
    if (!comments.length)
        return apis;
    return apis.reduce((apiList, apiItem) => {
        const { name: apiName = '' } = apiItem;
        const item = Object.assign({ name: apiName }, apiItem);
        // 单个api根据注释的name字段来匹配
        const sameNameComment = comments.find((comment) => comment.name === apiName);
        // console.log(apiItem.params[0],  comments[0].params[0])
        if (sameNameComment) {
            item.description = sameNameComment.description;
            item.params = item.params.reduce((params, apiParamItem) => {
                const item = Object.assign({}, apiParamItem);
                // 先匹配单个api的name 与 单个comment 单个param 的 key 字段
                // 然后再匹配 单个api 与 单个comment 单个param的description 字段
                const sameKeyComment = sameNameComment.params.find((commentParamItem) => commentParamItem.key === apiParamItem.name);
                if (sameKeyComment) {
                    if (sameKeyComment.key === item.name) {
                        item.description = sameKeyComment.description;
                    }
                }
                params.push(item);
                return params;
            }, []);
        }
        apiList.push(item);
        return apiList;
    }, []);
}
