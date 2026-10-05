import { ApplyMiddleware, Controller, Patch } from '@inversifyjs/http-core';

import { SuccessfulHonoMiddleware } from '../../middlewares/hono/SuccessfulHonoMiddleware.js';

@Controller('/warriors')
export class WarriorsPatchSuccessfulHonoMiddlewareController {
  @ApplyMiddleware(SuccessfulHonoMiddleware)
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
