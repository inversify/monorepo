import { ApplyMiddleware, Controller, Put } from '@inversifyjs/http-core';

import { SuccessfulExpressV4Middleware } from '../../middlewares/express4/SuccessfulExpressV4Middleware';

@Controller('/warriors')
export class WarriorsPutSuccessfulExpressV4MiddlewareController {
  @ApplyMiddleware(SuccessfulExpressV4Middleware)
  @Put()
  public async putWarrior(): Promise<void> {}
}
