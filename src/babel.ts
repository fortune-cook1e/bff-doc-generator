import babel, { parseAsync, transformFromAstAsync, transformSync } from '@babel/core'
import { sourceCode } from './const'
const readline = require('readline')
const path = require('path')
const fs = require('fs')
const fsa = require('fs-extra')
const beautify = require('js-beautify').js

// const sourceCode = 'const a = 1'

async function getAst() {
  const parsedAst = await parseAsync(sourceCode, {
   parserOpts: { allowReturnOutsideFunction: true },
    plugins: [
      ['@babel/plugin-transform-typescript'],
      ['@babel/plugin-proposal-decorators', { 'legacy': true }],
    ]
  }
)
// console.log({ parsedAst })
   // const { code: resultCode } = await transformFromAstAsync(parsedAst, sourceCode)
  // console.log({ resultCode })
}

// getAst()
const rl = readline.createInterface({
  input: fs.createReadStream(path.join(__dirname, './const.ts')),
 //  output: process.stdout
})

let line = 0
let lineData = ''

rl.on('line', (input) => {
  line++
  if (line >= 5 && line <= 22) {
    lineData = lineData + input + '\n'
  }
  if (line > 22) {
    rl.close()
  }
  // console.log(`接收到：${input}`)
})

rl.on('close', (input) => {
 //  console.log({ lineData })
   // const beautifyData = beautify(lineData)
  // console.log(beautifyData)
   fs.writeFileSync('123.js', lineData, 'utf-8')
})
