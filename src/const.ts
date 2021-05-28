export const sourceCode = `
import { Post, JsonController, UseBefore, Ctx, BodyParam, HeaderParam } from "routing-controllers";
import { MetaData, AnyResponse } from "../utils/types";
import UseMetaData from "../middleware/decorators/params/UseMetaData";
import AuthoMiddleware from "@yunke/aicst-service-check"
import { authoMiddlewareConfigs } from "../utils/common"
import { Context } from "koa";
import { Inject } from "typedi";

import userService from '../service/UserService'


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
    @BodyParam('code',{required:true}) code?: string,
    @BodyParam('grant_type',{required:true}) grantType?:string,
  ):Promise<AnyResponse> {
    return this.userService.CodeToUserIdAndCorpid({
      grantType, miniAppId, code, ctx
    })
  }
}
`