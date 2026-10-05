import { ApplyMiddleware, Controller, Post } from '@inversifyjs/http-core';

import { SuccessfulHonoMiddleware } from '../../middlewares/hono/SuccessfulHonoMiddleware.js';

@Controller('/warriors')
export class WarriorsPostSuccessfulHonoMiddlewareController {
  @ApplyMiddleware(SuccessfulHonoMiddleware)
  @Post()
  public async postWarrior(): Promise<void> {}
}
