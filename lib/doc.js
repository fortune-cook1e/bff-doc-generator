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
const fs = require("fs-extra");
const ora = require("ora");
const ast_1 = require("./ast");
const path = require('path');
class Doc {
    constructor(config) {
        this.config = {
            controllerPath: '',
            outputPath: ''
        };
        this.config = config;
        console.log({ config });
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            const spinner = ora('start generate document..').start();
            try {
                const filePaths = yield this.getControllerPath();
                const runPromises = filePaths.map((controllerFilePath) => this.runFile(controllerFilePath));
                const allControllerData = yield Promise.all([...runPromises]);
                const dir = process.cwd() + '/src/doc';
                const output = this.config.outputPath || dir;
                fs.writeJSONSync(`${output}/doc.json`, allControllerData, {
                    encoding: 'utf-8',
                    spaces: 1
                });
                spinner.succeed('document created successfully!');
                return allControllerData;
            }
            catch (e) {
                console.log(e);
                spinner.fail('document failed to create');
            }
        });
    }
    getControllerPath() {
        return new Promise((resolve) => {
            const { controllerPath = '' } = this.config;
            const files = fs.readdirSync(controllerPath);
            const paths = files.map((file) => controllerPath + file);
            const filterPaths = paths.filter((item) => item.includes('SellerController'));
            resolve(paths);
        });
    }
    getTemplate() {
        const templateFilePath = path.join(__dirname, './template.html');
        const fileData = fs.readFileSync(templateFilePath).toString();
        return fileData;
    }
    runFile(runFilePath) {
        return new Promise((resolve) => {
            const data = fs.readFileSync(runFilePath, 'utf-8');
            ast_1.runString(data, runFilePath)
                .then(controllerData => {
                resolve(controllerData);
            });
        });
    }
}
exports.default = Doc;
