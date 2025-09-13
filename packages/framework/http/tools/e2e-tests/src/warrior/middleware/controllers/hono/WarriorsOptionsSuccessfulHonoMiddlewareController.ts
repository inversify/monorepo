import { ApplyMiddleware, Controller, Options } from '@inversifyjs/http-core';

import { SuccessfulHonoMiddleware } from '../../middlewares/hono/SuccessfulHonoMiddleware';

@Controller('/warriors')
export class WarriorsOptionsSuccessfulHonoMiddlewareController {
  @ApplyMiddleware(SuccessfulHonoMiddleware)
  @Options()
  public async optionsWarrior(): Promise<void> {}
}
