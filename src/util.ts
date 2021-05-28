
type TsAnnotationName = {
  type:string;
  name:string;
}

type TsAnnotation = {
  type:'TSTypeReference' | string;
  typeName?:TsAnnotationName;
}

type ParamTsAnnotation = {
  type:'TSTypeAnnotation';
  typeAnnotation:TsAnnotation
}

const TypescriptTypeMap = {
  'TSAnyKeyword': 'any',
  'TSStringKeyword': 'string',
  'TSArrayType': 'array',
  'TSBooleanKeyword': 'boolean',
  'TSNumberKeyword': 'number',
}

/**
 * @description 判断当前参数类型
 * @param {ParamTsAnnotation} typeAnnotation
 * @date 2021-05-20 23:24:41
 * @return {*}
 */
export function decideTsType(typeAnnotation:ParamTsAnnotation):string {
  // console.log(typeAnnotation.typeAnnotation.type)
  const { typeAnnotation: { type: innerType = '' }} = typeAnnotation
  // 如果参数类型为引用类型 那么则返回引用类型值 例如 username:Username 那么 Username 就为引用类型
  if (innerType === 'TSTypeReference') {
    const  { type = '', name = '' } = typeAnnotation.typeAnnotation.typeName
    return type === 'Identifier' ? name : ''
  }
  return TypescriptTypeMap[innerType]
}

