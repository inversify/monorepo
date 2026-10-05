import { ApplyMiddleware, Controller, Delete } from '@inversifyjs/http-core';

import { SuccessfulHonoMiddleware } from '../../middlewares/hono/SuccessfulHonoMiddleware.js';
import { UnsuccessfulHonoMiddleware } from '../../middlewares/hono/UnsuccessfulHonoMiddleware.js';

@Controller('/warriors')
export class WarriorsDeleteUnsuccessfulHonoMiddlewareController {
  @ApplyMiddleware(SuccessfulHonoMiddleware, UnsuccessfulHonoMiddleware)
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
