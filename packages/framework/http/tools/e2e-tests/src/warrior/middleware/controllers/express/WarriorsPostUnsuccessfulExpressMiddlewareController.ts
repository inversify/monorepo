import { ApplyMiddleware, Controller, Post } from '@inversifyjs/http-core';

import { SuccessfulExpressMiddleware } from '../../middlewares/express/SuccessfulExpressMiddleware.js';
import { UnsuccessfulExpressMiddleware } from '../../middlewares/express/UnsuccessfulExpressMiddleware.js';

@Controller('/warriors')
export class WarriorsPostUnsuccessfulExpressMiddlewareController {
  @ApplyMiddleware(SuccessfulExpressMiddleware, UnsuccessfulExpressMiddleware)
  @Post()
  public async postWarrior(): Promise<void> {}
}
