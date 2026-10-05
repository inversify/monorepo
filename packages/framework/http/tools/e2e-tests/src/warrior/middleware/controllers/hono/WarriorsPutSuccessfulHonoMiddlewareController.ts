import { ApplyMiddleware, Controller, Put } from '@inversifyjs/http-core';

import { SuccessfulHonoMiddleware } from '../../middlewares/hono/SuccessfulHonoMiddleware.js';

@Controller('/warriors')
export class WarriorsPutSuccessfulHonoMiddlewareController {
  @ApplyMiddleware(SuccessfulHonoMiddleware)
  @Put()
  public async putWarrior(): Promise<void> {}
}
