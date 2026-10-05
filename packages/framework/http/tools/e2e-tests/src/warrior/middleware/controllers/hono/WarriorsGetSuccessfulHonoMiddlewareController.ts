import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';

import { SuccessfulHonoMiddleware } from '../../middlewares/hono/SuccessfulHonoMiddleware.js';

@Controller('/warriors')
export class WarriorsGetSuccessfulHonoMiddlewareController {
  @ApplyMiddleware(SuccessfulHonoMiddleware)
  @Get()
  public async getWarrior(): Promise<void> {}
}
