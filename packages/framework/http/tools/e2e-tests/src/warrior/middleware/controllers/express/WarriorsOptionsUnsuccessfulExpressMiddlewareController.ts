import { ApplyMiddleware, Controller, Options } from '@inversifyjs/http-core';

import { SuccessfulExpressMiddleware } from '../../middlewares/express/SuccessfulExpressMiddleware.js';
import { UnsuccessfulExpressMiddleware } from '../../middlewares/express/UnsuccessfulExpressMiddleware.js';

@Controller('/warriors')
export class WarriorsOptionsUnsuccessfulExpressMiddlewareController {
  @ApplyMiddleware(SuccessfulExpressMiddleware, UnsuccessfulExpressMiddleware)
  @Options()
  public async optionsWarrior(): Promise<void> {}
}
