import { ApplyMiddleware, Controller, Post } from '@inversifyjs/http-core';

import { SuccessfulExpressMiddleware } from '../../middlewares/express/SuccessfulExpressMiddleware.js';

@Controller('/warriors')
export class WarriorsPostSuccessfulExpressMiddlewareController {
  @ApplyMiddleware(SuccessfulExpressMiddleware)
  @Post()
  public async postWarrior(): Promise<void> {}
}
