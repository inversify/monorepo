import { ApplyMiddleware, Controller, Options } from '@inversifyjs/http-core';

import { SuccessfulExpressV4Middleware } from '../../middlewares/express4/SuccessfulExpressV4Middleware';

@Controller('/warriors')
export class WarriorsOptionsSuccessfulExpressV4MiddlewareController {
  @ApplyMiddleware(SuccessfulExpressV4Middleware)
  @Options()
  public async optionsWarrior(): Promise<void> {}
}
