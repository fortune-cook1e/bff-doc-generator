import * as fs from 'fs-extra'
import * as path from 'path'
const { parse } = require('@typescript-eslint/typescript-estree')

type AnyOptions = {
  [propname:string]:any;
}

const str = '*\n   * @description 登录获取userid corpid\n   * @param metadata metadat awowo dsads\n   * @param code hahad ss\n   '

const newStr = str.replace(/\n/g, '').replace(/\*/g, '').trim()

console.log({ newStr })

export async function runString(code:string, controllerFilePath:string):Promise<void> {
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

  const [methods, comments] = await Promise.all([getAstMethods(ast), getAstComments(ast)])

  // const [methods] = await Promise.all([getAstMethods(ast)])

  const astMethods = methods.map((method:AnyOptions) => {
    const routeInfo = getMethodRouteInformation(method)
    const params = getAstMethodParams(method)
    return {
      ...routeInfo,
      params
    }
  })

  const data = {
    methods: astMethods,
    comments: ast.comments
  }

  const dir = process.cwd() + '/src/doc'

  fs.writeJSONSync(`${dir}/${filename}-.json`, data, {
    encoding: 'utf-8',
    spaces: 1
  })
}

/**
 * @description 获取ast方法节点
 * @param {any} ast
 * @date 2021-05-15 18:52:14
 * @return {*}
 */
export function getAstMethods(ast:AnyOptions):Promise<AnyOptions[]> {
  let methods:AnyOptions[] = []
  return new Promise((resolve, reject) => {
    try {
      // 只保留 method 类型
      const classDecAstNode = ast.body.find((node:AnyOptions) => node.type === 'ExportDefaultDeclaration')
      methods = classDecAstNode.declaration.body.body.filter((node:AnyOptions) => node.type === 'MethodDefinition')
      resolve(methods)
    } catch (e) {
      console.log(e)
      reject(methods)
    }
  })
}
/**
 * @description 获取method的路由地址与ajax方法
 * @date 2021-05-15 22:14:24
 */

export function getMethodRouteInformation(methodAst:AnyOptions):{ajaxMethod:string, route:string} {
  const info = {
    ajaxMethod: '',
    route: ''
  }

  const { decorators = [] } = methodAst
  const ajaxMethods = ['post', 'get', 'POST', 'GET', 'Post', 'Get']
  const routeInfo = decorators.find((item:AnyOptions) => ajaxMethods.includes(item.expression.callee.name))
  if (routeInfo) {
    info.ajaxMethod = routeInfo.expression.callee.name
    info.route = routeInfo.expression.arguments[0].value
  }

  console.log({ routeInfo })
  return info
}
/**
 * @description 获取函数参数
 * @param {AnyOptions} methodAst
 * @date 2021-05-16 17:29:39
 * @return {*}
 */
export function getAstMethodParams(methodAst:AnyOptions):string[] {
  const { value: { params = [] }} = methodAst
  return params.reduce((list, item) => {
    if (item.type === 'Identifier') {
      list.push(item.name)
    }
    return list
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