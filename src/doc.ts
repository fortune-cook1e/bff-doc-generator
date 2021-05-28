import * as fs from 'fs-extra'
import * as ora from 'ora'
import { runString, AnyOptions  } from './ast'

export interface Config {
  controllerPath:string;
}

export default class Doc {
  config:Config = {
    controllerPath: ''
  }

  constructor(config:Config) {
    this.config = config
  }

   create():void {
    const spinner = ora('start generate document..').start()
    try {
      this.getControllerPath()
      .then((filePaths:string[]) => {
        const runPromises = filePaths.map((controllerFilePath:string) => this.runFile(controllerFilePath))
        // 将所有的controller数据合并在一起
        Promise.all([...runPromises])
        .then((controllerData) => {
          const dir = process.cwd() + '/src/doc'
          fs.writeFileSync(`${dir}/doc.js`, 'module.exports = ' + JSON.stringify(controllerData, null, 2), 'utf-8')
          fs.writeJSONSync(`${dir}/doc.json`, controllerData, {
            encoding: 'utf-8',
            spaces: 1
          })
          spinner.succeed('document created successfully!')
        })
      })
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
      const filterPaths = paths.filter((item:string) => item.includes('UserController'))
      resolve(filterPaths)
    })
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