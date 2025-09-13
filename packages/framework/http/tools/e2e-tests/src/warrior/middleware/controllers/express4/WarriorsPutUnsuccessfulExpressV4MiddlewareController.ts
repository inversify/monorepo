import { ApplyMiddleware, Controller, Put } from '@inversifyjs/http-core';

import { SuccessfulExpressV4Middleware } from '../../middlewares/express4/SuccessfulExpressV4Middleware';
import { UnsuccessfulExpressV4Middleware } from '../../middlewares/express4/UnsuccessfulExpressV4Middleware';

@Controller('/warriors')
export class WarriorsPutUnsuccessfulExpressV4MiddlewareController {
  @ApplyMiddleware(
    SuccessfulExpressV4Middleware,
    UnsuccessfulExpressV4Middleware,
  )
  @Put()
  public async putWarrior(): Promise<void> {}
}
