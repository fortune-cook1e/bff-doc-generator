import babel, { parseAsync, transformFromAstAsync, transformSync } from '@babel/core'
import { sourceCode } from './const'

// const sourceCode = 'const a:string = \'1\''

async function getAst() {
  const parsedAst = await transformSync(sourceCode, {
   parserOpts: { allowReturnOutsideFunction: true },
    plugins: [
      ['@babel/plugin-transform-typescript'],
      ['@babel/plugin-proposal-decorators', { 'legacy': true }],
    ]
  }
)
  console.log({ parsedAst })

  const { code: resultCode } = await transformFromAstAsync(parsedAst, sourceCode)
  console.log({ resultCode })
}

getAst()