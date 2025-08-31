import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';

import { SuccessfulExpressV4Middleware } from '../../middlewares/express4/SuccessfulExpressV4Middleware';

@Controller('/warriors')
export class WarriorsGetSuccessfulExpressV4MiddlewareController {
  @ApplyMiddleware(SuccessfulExpressV4Middleware)
  @Get()
  public async getWarrior(): Promise<void> {}
}
