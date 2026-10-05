import { ApplyMiddleware, Controller, Patch } from '@inversifyjs/http-core';

import { SuccessfulExpressV4Middleware } from '../../middlewares/express4/SuccessfulExpressV4Middleware.js';
import { UnsuccessfulExpressV4Middleware } from '../../middlewares/express4/UnsuccessfulExpressV4Middleware.js';

@Controller('/warriors')
export class WarriorsPatchUnsuccessfulExpressV4MiddlewareController {
  @ApplyMiddleware(
    SuccessfulExpressV4Middleware,
    UnsuccessfulExpressV4Middleware,
  )
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
