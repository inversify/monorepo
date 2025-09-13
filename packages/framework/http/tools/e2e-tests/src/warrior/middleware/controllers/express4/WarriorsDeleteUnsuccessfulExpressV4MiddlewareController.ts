import { ApplyMiddleware, Controller, Delete } from '@inversifyjs/http-core';

import { SuccessfulExpressV4Middleware } from '../../middlewares/express4/SuccessfulExpressV4Middleware';
import { UnsuccessfulExpressV4Middleware } from '../../middlewares/express4/UnsuccessfulExpressV4Middleware';

@Controller('/warriors')
export class WarriorsDeleteUnsuccessfulExpressV4MiddlewareController {
  @ApplyMiddleware(
    SuccessfulExpressV4Middleware,
    UnsuccessfulExpressV4Middleware,
  )
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
