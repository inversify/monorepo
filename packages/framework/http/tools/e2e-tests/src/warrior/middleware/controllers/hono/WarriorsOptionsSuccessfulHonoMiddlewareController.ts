import { ApplyMiddleware, Controller, Options } from '@inversifyjs/http-core';

import { SuccessfulHonoMiddleware } from '../../middlewares/hono/SuccessfulHonoMiddleware.js';

@Controller('/warriors')
export class WarriorsOptionsSuccessfulHonoMiddlewareController {
  @ApplyMiddleware(SuccessfulHonoMiddleware)
  @Options()
  public async optionsWarrior(): Promise<void> {}
}
