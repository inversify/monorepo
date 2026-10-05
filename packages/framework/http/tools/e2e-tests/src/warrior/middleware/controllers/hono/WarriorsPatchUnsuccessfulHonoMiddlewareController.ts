import { ApplyMiddleware, Controller, Patch } from '@inversifyjs/http-core';

import { SuccessfulHonoMiddleware } from '../../middlewares/hono/SuccessfulHonoMiddleware.js';
import { UnsuccessfulHonoMiddleware } from '../../middlewares/hono/UnsuccessfulHonoMiddleware.js';

@Controller('/warriors')
export class WarriorsPatchUnsuccessfulHonoMiddlewareController {
  @ApplyMiddleware(SuccessfulHonoMiddleware, UnsuccessfulHonoMiddleware)
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
