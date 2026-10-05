import { ApplyMiddleware, Controller, Options } from '@inversifyjs/http-core';

import { SuccessfulHonoMiddleware } from '../../middlewares/hono/SuccessfulHonoMiddleware.js';
import { UnsuccessfulHonoMiddleware } from '../../middlewares/hono/UnsuccessfulHonoMiddleware.js';

@Controller('/warriors')
export class WarriorsOptionsUnsuccessfulHonoMiddlewareController {
  @ApplyMiddleware(SuccessfulHonoMiddleware, UnsuccessfulHonoMiddleware)
  @Options()
  public async optionsWarrior(): Promise<void> {}
}
