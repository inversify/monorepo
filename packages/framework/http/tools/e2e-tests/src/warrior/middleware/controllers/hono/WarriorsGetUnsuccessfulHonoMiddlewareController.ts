import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';

import { SuccessfulHonoMiddleware } from '../../middlewares/hono/SuccessfulHonoMiddleware.js';
import { UnsuccessfulHonoMiddleware } from '../../middlewares/hono/UnsuccessfulHonoMiddleware.js';

@Controller('/warriors')
export class WarriorsGetUnsuccessfulHonoMiddlewareController {
  @ApplyMiddleware(SuccessfulHonoMiddleware, UnsuccessfulHonoMiddleware)
  @Get()
  public async getWarrior(): Promise<void> {}
}
