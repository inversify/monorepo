import { ApplyMiddleware, Controller, Patch } from '@inversifyjs/http-core';

import { SuccessfulExpressMiddleware } from '../../middlewares/express/SuccessfulExpressMiddleware.js';

@Controller('/warriors')
export class WarriorsPatchSuccessfulExpressMiddlewareController {
  @ApplyMiddleware(SuccessfulExpressMiddleware)
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
