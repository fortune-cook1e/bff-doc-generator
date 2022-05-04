# bff-doc-generator

bff文档生成器

## why

目前就职的公司需要前端用 __node + ts__ 写 __bff__ 层，主要是配合 __routing-controllers__ 这个库来书写 __controller__ 层，但是随着 __controller__ 聚合的 __api__ 增多，查询起来比较困难。
从前端页面要查看一个接口的请求参数的过程：network查看请求 -> 根据对应的api查到controller -> 根据具体的api路径查到某个controller下的某个方法 -> 查看请求参数

整个过程较为复杂，并且翻看代码成本较高，没有一个页面化的工具查看，所以就写了这么一个脚本解决这个痛点。

## Usage

代码示例如下：

```js
  @JsonController('/v1/user')
  @UseBefore(AuthoMiddleware(authoMiddlewareConfigs))
  export default class UserController {
    @Inject() private userService: userService;


    /**
     * @description 登录获取userid corpid
     * @name login
     * @param metadata metadat awowo dsads
     * @param code hahad ss
     */
    @Post('/login')
    async login(
      @UseMetaData() metadata: MetaData,
      @HeaderParam("mini-app-id") miniAppId: string,
      @Ctx() ctx: Context,
      @BodyParam('code',{required:true}) code: string,
      @BodyParam('grant_type',{required:true}) grantType:string,
    ):Promise<AnyResponse> {
      return this.userService.CodeToUserIdAndCorpid({
        grantType, miniAppId, code, ctx
      })
    }
  }
```

生成的 __json__ 文件格式如下：

```json
{
 "controllerName": "usercontroller",
 "apiPrefix": "/v1/user",
 "apis": [
  {
   "name": "login",
   "route": "/login",
   "description": " 登录获取userid corpid",
   "ajaxMethod": "Post",
   "params": [
    {
     "name": "metadata",
     "type": "MetaData",
     "description": "metadat awowo dsads",
     "isRequired": false
    },
    {
     "name": "miniAppId",
     "type": "TSStringKeyword",
     "description": "",
     "isRequired": false
    },
    {
     "name": "ctx",
     "type": "Context",
     "description": "",
     "isRequired": false
    },
    {
     "name": "code",
     "type": "TSStringKeyword",
     "description": "hahad ss",
     "isRequired": false
    },
    {
     "name": "grantType",
     "type": "TSStringKeyword",
     "description": "",
     "isRequired": false
    }
   ]
  }
 ]
}

```


### 效果图
![demo](https://github.com/fortune-cook1e/bff-doc-generator/blob/master/demo.png?raw=true)
