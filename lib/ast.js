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
 * @description ??????controller????????????
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
            // ??????jsonController????????? ?????????????????????value??? ??????api??????
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
 * @description ??????ast????????????
 * @param {any} ast
 * @date 2021-05-15 18:52:14
 * @return {*}
 */
function getAstApis(ast, controllerFilePath) {
    // let methods:AnyOptions[] = []
    return new Promise((resolve, reject) => {
        try {
            const classDecAstNode = ast.body.find((node) => node.type === 'ExportDefaultDeclaration');
            // ????????? MethodDefinition ??????
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
 * @description ??????ast method????????????
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
    // TODO: ??????????????????readline????????????????????? ???????????????????????????????????????
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
 * @description ????????????api??? ??????????????????????????????????????????
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
 * @description ??????????????????
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
                // optional ???true ????????????????????????
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
 * @description ??????ast ????????????
 * @param {any} ast
 * @date 2021-05-15 19:23:12
 * @return {string[]}
 */
// ????????????????????????
// const comment = {
// 	description:'',   // ??????????????????
// 	name:'',          // ??????????????????
// 	params:[          // ????????????
// 		{
// 			key:'',       // ????????????
// 			description:''      // ??????????????????
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
 * @description ?????????comment ??????????????????`@`???????????????????????? '@description' xxx
 * @param {AnyOptions} comment
 * @date 2021-05-24 21:08:58
 * @return {AnyOptions[]}
 */
function getTransformedComment(comment) {
    return comment.replace(/\n/g, '').split('*').filter((item) => item.includes('@')).map((item) => item.trim());
}
/**
 * @description ????????????comment???description
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
 * @description ????????????comment???name??????
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
 * @description ??????????????????????????????????????????
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
        // ??????item????????? @param metadata metadat awowo dsads
        const firstSpaceIndex = item.indexOf(' ');
        const inexistence = -1;
        // ???????????????????????????,?????????????????????
        // ?????????????????????????????????????????? ?????????
        // ???????????????????????????????????????
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
 * @description ??????????????????apis???comments??????
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
        // ??????api???????????????name???????????????
        const sameNameComment = comments.find((comment) => comment.name === apiName);
        // console.log(apiItem.params[0],  comments[0].params[0])
        if (sameNameComment) {
            item.description = sameNameComment.description;
            item.params = item.params.reduce((params, apiParamItem) => {
                const item = Object.assign({}, apiParamItem);
                // ???????????????api???name ??? ??????comment ??????param ??? key ??????
                // ??????????????? ??????api ??? ??????comment ??????param???description ??????
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
