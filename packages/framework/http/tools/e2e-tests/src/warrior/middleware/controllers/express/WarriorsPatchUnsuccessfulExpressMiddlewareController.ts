import { ApplyMiddleware, Controller, Patch } from '@inversifyjs/http-core';

import { SuccessfulExpressMiddleware } from '../../middlewares/express/SuccessfulExpressMiddleware.js';
import { UnsuccessfulExpressMiddleware } from '../../middlewares/express/UnsuccessfulExpressMiddleware.js';

@Controller('/warriors')
export class WarriorsPatchUnsuccessfulExpressMiddlewareController {
  @ApplyMiddleware(SuccessfulExpressMiddleware, UnsuccessfulExpressMiddleware)
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
