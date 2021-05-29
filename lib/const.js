"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sourceCode = void 0;
exports.sourceCode = `
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
    @BodyParam('code',{required:true}) code?: string,
    @BodyParam('grant_type',{required:true}) grantType?:string,
  ):Promise<AnyResponse> {
    return this.userService.CodeToUserIdAndCorpid({
      grantType, miniAppId, code, ctx
    })
  }
}
`;
