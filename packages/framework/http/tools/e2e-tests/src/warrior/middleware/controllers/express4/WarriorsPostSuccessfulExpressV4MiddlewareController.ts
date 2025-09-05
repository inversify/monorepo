import { ApplyMiddleware, Controller, Post } from '@inversifyjs/http-core';

import { SuccessfulExpressV4Middleware } from '../../middlewares/express4/SuccessfulExpressV4Middleware';

@Controller('/warriors')
export class WarriorsPostSuccessfulExpressV4MiddlewareController {
  @ApplyMiddleware(SuccessfulExpressV4Middleware)
  @Post()
  public async postWarrior(): Promise<void> {}
}
