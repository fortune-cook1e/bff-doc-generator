import * as fs from 'fs-extra'
import * as ora from 'ora'
import { runString  } from './ast'

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
        Promise.all([...runPromises])
        .then(() => {
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
      // const filterPaths = paths.filter((item:string) => item.includes('UserController'))
      resolve(paths)
    })
  }

  runFile(runFilePath:string):Promise<void> {
    return new Promise((resolve) => {
      const data = fs.readFileSync(runFilePath, 'utf-8')
      runString(data, runFilePath)
      resolve()
    })
  }
}