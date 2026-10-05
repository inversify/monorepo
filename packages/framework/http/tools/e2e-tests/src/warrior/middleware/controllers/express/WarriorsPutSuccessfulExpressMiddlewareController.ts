import { ApplyMiddleware, Controller, Put } from '@inversifyjs/http-core';

import { SuccessfulExpressMiddleware } from '../../middlewares/express/SuccessfulExpressMiddleware.js';

@Controller('/warriors')
export class WarriorsPutSuccessfulExpressMiddlewareController {
  @ApplyMiddleware(SuccessfulExpressMiddleware)
  @Put()
  public async putWarrior(): Promise<void> {}
}
