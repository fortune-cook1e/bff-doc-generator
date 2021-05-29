import * as fs from 'fs-extra'
import * as ora from 'ora'
import { runString, AnyOptions  } from './ast'
const path = require('path')

export interface Config {
  controllerPath:string;    // controller所在文件夹
  outputPath:string;        // 文档json文件输出文件夹地址
}

export default class Doc {
  config:Config = {
    controllerPath: '',
    outputPath: ''
  }

  constructor(config:Config) {
    this.config = config
    console.log({ config })
  }

    async create():Promise<AnyOptions> {
    const spinner = ora('start generate document..').start()
    try {
      const filePaths = await this.getControllerPath()
      const runPromises = filePaths.map((controllerFilePath:string) => this.runFile(controllerFilePath))
      const allControllerData = await Promise.all([...runPromises])
      const dir = process.cwd() + '/src/doc'
      const output = this.config.outputPath || dir
      fs.writeJSONSync(`${output}/doc.json`, allControllerData, {
        encoding: 'utf-8',
        spaces: 1
      })
      spinner.succeed('document created successfully!')
      return allControllerData
    } catch (e) {
      console.log(e)
      spinner.fail('document failed to create')
    }
  }

  getControllerPath():Promise<string[]> {
    return new Promise((resolve) => {
      const { controllerPath = '' } = this.config
      const files = fs.readdirSync(controllerPath)
      const paths = files.map((file:string) => controllerPath + file)
      const filterPaths = paths.filter((item:string) => item.includes('SellerController'))
      resolve(paths)
    })
  }

  getTemplate():string {
    const templateFilePath = path.join(__dirname, './template.html')
    const fileData = fs.readFileSync(templateFilePath).toString()
    return fileData
  }

  runFile(runFilePath:string):Promise<AnyOptions> {
    return new Promise((resolve) => {
      const data = fs.readFileSync(runFilePath, 'utf-8')
      runString(data, runFilePath)
        .then(controllerData => {
          resolve(controllerData)
        })
    })
  }
}