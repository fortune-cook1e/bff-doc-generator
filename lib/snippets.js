"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSnippetsByFile = exports.getSnippets = void 0;
const readline = require('readline');
const fs = require('fs');
/**
 * @description 获取指定文件2行之间的内容
 * @param {number} startLine 起始行
 * @param {number} endLine 结束行
 * @param {string} filePath 文件路径
 * @date 2021-05-28 22:20:25
 */
function getSnippets(startLine, endLine, filePath) {
    let line = 0;
    let lineData = '';
    return new Promise((resolve) => {
        try {
            const rl = readline.createInterface({
                input: fs.createReadStream(filePath),
            });
            rl.on('line', (input) => {
                if (line >= startLine - 1 && line <= endLine) {
                    lineData = lineData + input + '\n';
                }
                line++;
                if (line > endLine) {
                    rl.close();
                }
            });
            rl.on('close', () => {
                resolve(lineData);
            });
        }
        catch (e) {
            resolve(lineData);
            console.log(e);
        }
    });
}
exports.getSnippets = getSnippets;
function getSnippetsByFile(startLine, endLine, filePath) {
    const data = fs.readFileSync(filePath).toString();
    const snippetsArray = data.split('\n');
    const snippets = snippetsArray.slice(startLine - 1, endLine).join('\n');
    return snippets;
}
exports.getSnippetsByFile = getSnippetsByFile;
