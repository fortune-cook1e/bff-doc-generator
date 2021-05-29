/**
 * @description 获取指定文件2行之间的内容
 * @param {number} startLine 起始行
 * @param {number} endLine 结束行
 * @param {string} filePath 文件路径
 * @date 2021-05-28 22:20:25
 */
export declare function getSnippets(startLine: number, endLine: number, filePath: string): Promise<string>;
export declare function getSnippetsByFile(startLine: number, endLine: number, filePath: string): string;
