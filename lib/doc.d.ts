import { AnyOptions } from './ast';
export interface Config {
    controllerPath: string;
    outputPath: string;
}
export default class Doc {
    config: Config;
    constructor(config: Config);
    create(): Promise<AnyOptions>;
    getControllerPath(): Promise<string[]>;
    getTemplate(): string;
    runFile(runFilePath: string): Promise<AnyOptions>;
}
