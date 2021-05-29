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
const core_1 = require("@babel/core");
const const_1 = require("./const");
const readline = require('readline');
const path = require('path');
const fs = require('fs');
const fsa = require('fs-extra');
const beautify = require('js-beautify').js;
// const sourceCode = 'const a = 1'
function getAst() {
    return __awaiter(this, void 0, void 0, function* () {
        const parsedAst = yield core_1.parseAsync(const_1.sourceCode, {
            parserOpts: { allowReturnOutsideFunction: true },
            plugins: [
                ['@babel/plugin-transform-typescript'],
                ['@babel/plugin-proposal-decorators', { 'legacy': true }],
            ]
        });
        // console.log({ parsedAst })
        // const { code: resultCode } = await transformFromAstAsync(parsedAst, sourceCode)
        // console.log({ resultCode })
    });
}
// getAst()
const rl = readline.createInterface({
    input: fs.createReadStream(path.join(__dirname, './const.ts')),
    //  output: process.stdout
});
let line = 0;
let lineData = '';
rl.on('line', (input) => {
    line++;
    if (line >= 5 && line <= 22) {
        lineData = lineData + input + '\n';
    }
    if (line > 22) {
        rl.close();
    }
    // console.log(`接收到：${input}`)
});
rl.on('close', (input) => {
    //  console.log({ lineData })
    // const beautifyData = beautify(lineData)
    // console.log(beautifyData)
    fs.writeFileSync('123.js', lineData, 'utf-8');
});
