declare type TsAnnotationName = {
    type: string;
    name: string;
};
declare type TsAnnotation = {
    type: 'TSTypeReference' | string;
    typeName?: TsAnnotationName;
};
declare type ParamTsAnnotation = {
    type: 'TSTypeAnnotation';
    typeAnnotation: TsAnnotation;
};
/**
 * @description 判断当前参数类型
 * @param {ParamTsAnnotation} typeAnnotation
 * @date 2021-05-20 23:24:41
 * @return {*}
 */
export declare function decideTsType(typeAnnotation: ParamTsAnnotation): string;
export {};
