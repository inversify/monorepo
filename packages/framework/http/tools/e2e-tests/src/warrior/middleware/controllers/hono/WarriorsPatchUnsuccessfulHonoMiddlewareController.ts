import { ApplyMiddleware, Controller, Patch } from '@inversifyjs/http-core';

import { SuccessfulHonoMiddleware } from '../../middlewares/hono/SuccessfulHonoMiddleware';
import { UnsuccessfulHonoMiddleware } from '../../middlewares/hono/UnsuccessfulHonoMiddleware';

@Controller('/warriors')
export class WarriorsPatchUnsuccessfulHonoMiddlewareController {
  @ApplyMiddleware(SuccessfulHonoMiddleware, UnsuccessfulHonoMiddleware)
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
