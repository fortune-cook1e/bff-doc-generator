import * as fs from 'fs-extra'
import * as path from 'path'
const { parse } = require('@typescript-eslint/typescript-estree')

import { decideTsType } from './util'
import {
  GetControllerInfoResponse,
  GetApiInfoResponse,
  GetAstMethodParamsResponse,
  TransformAstMethodItemResponse
} from './types'

type AnyOptions = {
  [propname:string]:any;
}

const AJAX_METHODS = ['Get', 'GET', 'Post', 'POST']

const str = '*\n   * @description 登录获取userid corpid\n   * @param metadata metadat awowo dsads\n   * @param code hahad ss\n   '

const newStr = str.replace(/\n/g, '').replace(/\*/g, '').trim()

console.log({ newStr })

export async function runString(code:string, controllerFilePath:string):Promise<void> {
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

    // const [methods] = await Promise.all([getAstMethods(ast)])

    // const astMethods = methods.map((method:AnyOptions) => {
    //   const routeInfo = getMethodRouteInformation(method)
    //   const params = getAstMethodParams(method)
    //   return {
    //     ...routeInfo,
    //     params
    //   }
    // })

    // const data = {
    //   methods: astMethods,
    //   comments: ast.comments
    // }

    const data = {
      controllerName,
      apiPrefix,
      apis
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
      params.push({
        name,
        type: paramTsType,
        description: '',
        isRequired: false
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
export function getAstComments(ast:AnyOptions):Promise<string[]> {
  let comments:string[] = []

  return new Promise((resolve, reject) => {
    try {
      // TODO: 功能待完善
      comments = ast.comments.reduce((array:string[], comment:any) => {
      // 这里主要是截取 @description 后面的描述 作为函数的解释
      // 目前只取 @description 块型注释
      if (comment.type === 'Block') {
        const description = comment.value.split('\n').map((item:string) => item.trim())[1].split('@description')[1]
        array.push(description)
      }
      return array
      }, [])
      resolve(comments)
    } catch (e) {
      console.log(e)
      reject(comments)
    }
  })
}