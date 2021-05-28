import * as fs from 'fs-extra'
import * as path from 'path'
const { parse } = require('@typescript-eslint/typescript-estree')

import { decideTsType } from './util'
import {
  GetControllerInfoResponse,
  GetApiInfoResponse,
  GetAstMethodParamsResponse,
  TransformAstMethodItemResponse,
  CommentItem,
  CommentParamItem,
  MethodParamItem
} from './types'

export type AnyOptions = {
  [propname:string]:any;
}

const AJAX_METHODS = ['Get', 'GET', 'Post', 'POST']

export async function runString(code:string, controllerFilePath:string):Promise<AnyOptions> {
  try {
    const filename = path.basename(controllerFilePath, '.ts').toLowerCase()
    const astOptions = {
      comment: true,
      loc: false,
      filePath: controllerFilePath,
      tokens: false,
      range: false,
      errorOnUnknownASTType: false,
      jsx: false,
      useJSXTextNode: false,
    }

    const ast = parse(code, astOptions)

    const [controllerInfo, apis, comments] = await Promise.all([
      getControllerInfo(ast, filename),
      getAstApis(ast),
      getAstComments(ast),
    ])

    const { controllerName = '', apiPrefix = '' } = controllerInfo

    const combinedApis = combineCommentsAndApis(apis, comments)

    const data = {
      controllerName,
      apiPrefix,
      apis: combinedApis
    }

    const dir = process.cwd() + '/src/doc'
    fs.writeJSONSync(`${dir}/${filename}-.json`, data, {
      encoding: 'utf-8',
      spaces: 1
    })
    fs.writeJSONSync(`${dir}/${filename}-ast.json`, ast, {
      encoding: 'utf-8',
      spaces: 1
    })
    return data
  } catch (e) {
    console.log(e)
  }
}

/**
 * @description 获取controller基本信息
 * @param {AnyOptions} ast
 * @param {string} filename
 * @date 2021-05-20 22:01:41
 * @return {GetControllerInfoResponse}
 */
export function getControllerInfo(ast:AnyOptions, filename:string):Promise<GetControllerInfoResponse> {
  return new Promise((resolve, reject) => {
    try {
      const classDecAstNode = ast.body.find((node:AnyOptions) => node.type === 'ExportDefaultDeclaration')
      const decorators = classDecAstNode?.declaration?.decorators
      // 找到jsonController装饰器 然后获取对应的value值 拿到api前缀
      const jsonControllerNode = decorators.find((item:AnyOptions) => item?.expression?.callee?.name === 'JsonController')
      resolve({
        controllerName: filename,
        apiPrefix: jsonControllerNode.expression.arguments[0].value
      })
    } catch (e) {
      console.log(e)
      reject({
        controllerName: filename,
        apiPrefix: ''
      })
    }
  })
}

/**
 * @description 获取ast方法节点
 * @param {any} ast
 * @date 2021-05-15 18:52:14
 * @return {*}
 */
export function getAstApis(ast:AnyOptions):Promise<TransformAstMethodItemResponse[]> {
  // let methods:AnyOptions[] = []
  return new Promise((resolve, reject) => {
    try {
      const classDecAstNode = ast.body.find((node:AnyOptions) => node.type === 'ExportDefaultDeclaration')
        // 只保留 MethodDefinition 类型
      const methodsNodes = classDecAstNode.declaration.body.body.filter((node:AnyOptions) => node.type === 'MethodDefinition')
      const apis = methodsNodes.reduce((apiList, methodItem) => {
        const item = transformAstMethodItem(methodItem)
        apiList.push(item)
        return apiList
      }, [])
      resolve(apis)
    } catch (e) {
      console.log(e)
      reject([])
    }
  })
}

/**
 * @description 转换ast method类型节点
 * @param {*}
 * @date 2021-05-20 23:32:44
 * @return {*}
 */
export function transformAstMethodItem(astMethodItem:AnyOptions):TransformAstMethodItemResponse {
  const { name = '', route = '', description = '', ajaxMethod = '' } = getApiInfo(astMethodItem)
  const params = getAstMethodParams(astMethodItem.value.params)
  return {
    name,
    route,
    description,
    ajaxMethod,
    params
  }
}

/**
 * @description 获取单个api的 函数名称、路由地址、请求方法
 * @param {AnyOptions} methodAst
 * @date 2021-05-20 22:42:16
 * @return {GetApiInfoResponse}
 */
export function getApiInfo(methodAst:AnyOptions):GetApiInfoResponse {
  const { key: { name = '' }} = methodAst
  const ajaxDecoratorItem = methodAst.decorators.find((item:AnyOptions) => AJAX_METHODS.includes(item.expression.callee.name)) || {}
  const {  expression: { callee: { name: ajaxMethod = '' }, arguments: decoratorItemArguments = [] }} = ajaxDecoratorItem
  const route = decoratorItemArguments[0].value || ''
  return {
    name,
    route,
    description: '',
    ajaxMethod
  }
}

/**
 * @description 获取函数参数
 * @param {AnyOptions} methodParams
 * @date 2021-05-16 17:29:39
 * @return {*}
 */
export function getAstMethodParams(methodParams:any[] = []):GetAstMethodParamsResponse[] {
  return methodParams.reduce((params, paramItem) => {
    if (paramItem.type === 'Identifier') {
      const { name = '', typeAnnotation } = paramItem
      const paramTsType = decideTsType(typeAnnotation)

      // optional 为true 那么参数为非必填
      const isRequired = !paramItem?.optional

      params.push({
        name,
        type: paramTsType,
        description: '',  // 这里的description只能从注释中拿
        isRequired: isRequired
      })
    }
    return params
  }, [])
}

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
export function getAstComments(ast:AnyOptions):Promise<string[]> {
  let comments:string[] = []

  return new Promise((resolve, reject) => {
    try {
      comments = ast.comments.reduce((array:CommentItem[], comment:AnyOptions) => {
        const commentItem:CommentItem = {
          description: '',
          name: '',
          params: []
        }

        if (comment.type === 'Block') {
          const transFormedValue = getTransformedComment(comment.value)
          commentItem.description = getCommentDescription(transFormedValue)
          commentItem.name = getCommentName(transFormedValue)
          commentItem.params = getCommentParams(transFormedValue)
        }

        array.push(commentItem)
        return array
      }, [])

      resolve(comments)
    } catch (e) {
      console.log(e)
      reject(comments)
    }
  })
}

/**
 * @description 将单个comment 转换为每项为`@`开头的数组。例如 '@description' xxx
 * @param {AnyOptions} comment
 * @date 2021-05-24 21:08:58
 * @return {AnyOptions[]}
 */
function getTransformedComment(comment:AnyOptions):string {
  return comment.replace(/\n/g, '').split('*').filter((item:string) => item.includes('@')).map((item:AnyOptions) => item.trim())
}

/**
 * @description 获取单个comment的description
 * @param {*} commentArray
 * @date 2021-05-24 21:10:24
 * @return {string}
 */
function getCommentDescription(commentItem):string {
  const descriptionSymbol = '@description'
  const descriptionItem = commentItem.find((item:AnyOptions) => item.includes(descriptionSymbol))
  if (!descriptionItem) return ''
  return descriptionItem.slice(descriptionSymbol.length) || ''
}

/**
 * @description 获取单个comment的name字段
 * @param {*} commentArray
 * @date 2021-05-24 21:14:54
 * @return {string}
 */
function getCommentName(commentItem):string {
  const nameSymbol = '@name'
  const nameItem = commentItem.find((item:AnyOptions) => item.includes(nameSymbol))
  if (!nameItem) return ''
  return nameItem.slice(nameSymbol.length).trim() || ''
}

/**
 * @description 获取函数每个参数以及参数注释
 * @param {*} commentItem
 * @date 2021-05-25 21:12:29
 */
function getCommentParams(commentItem):CommentParamItem[] {
  const paramSymbol = '@param'
  const paramList = commentItem.filter((item:AnyOptions) => item.includes(paramSymbol))
  if (!paramList.length) return []
  const params = paramList.reduce((list, item) => {
    const paramItem:CommentParamItem = {
      key: '',
      description: ''
    }
    // 每个item形式为 @param metadata metadat awowo dsads
    const firstSpaceIndex = item.indexOf(' ')
    const inexistence = -1
    // 先拿到第一个空格值,再拿第二个空格
    // 第一个空格与第二个空格之间为 参数值
    // 第二个空格之后为参数的注释
    if (firstSpaceIndex !== inexistence) {
      const secondSpaceIndex = item.indexOf(' ', firstSpaceIndex + 1)
      if (secondSpaceIndex !== inexistence) {
        paramItem.key = item.slice(firstSpaceIndex, secondSpaceIndex).trim()
        paramItem.description = item.slice(secondSpaceIndex).trim()
      }
    }
    list.push(paramItem)
    return list
  }, [])
  return params
}

/**
 * @description 合并转换后的apis和comments字段
 * @param {*} apis
 * @param {*} comments
 * @date 2021-05-25 21:38:52
 */
function combineCommentsAndApis(apis, comments) {
  if (!apis.length) return []
  if (!comments.length) return apis

  return apis.reduce((apiList, apiItem:TransformAstMethodItemResponse) => {
    const { name: apiName = '' } = apiItem
    const item:TransformAstMethodItemResponse = {
      name: apiName,
      ...apiItem
    }

    // 单个api根据注释的name字段来匹配
    const sameNameComment = comments.find((comment:CommentItem) => comment.name === apiName)
    // console.log(apiItem.params[0],  comments[0].params[0])
    if (sameNameComment) {
      item.description = sameNameComment.description
      item.params = item.params.reduce((params, apiParamItem:MethodParamItem) => {
        const item:MethodParamItem = {
          ...apiParamItem
        }
        // 先匹配单个api的name 与 单个comment 单个param 的 key 字段
        // 然后再匹配 单个api 与 单个comment 单个param的description 字段
        const sameKeyComment = sameNameComment.params.find((commentParamItem:CommentParamItem) => commentParamItem.key === apiParamItem.name)
        if (sameKeyComment) {
          if (sameKeyComment.key === item.name) {
            item.description = sameKeyComment.description
          }
        }
        params.push(item)
        return params
      }, [])
    }

    apiList.push(item)

    return apiList
  }, [])
}