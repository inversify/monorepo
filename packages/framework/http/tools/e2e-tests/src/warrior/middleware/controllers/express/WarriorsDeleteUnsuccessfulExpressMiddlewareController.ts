import { ApplyMiddleware, Controller, Delete } from '@inversifyjs/http-core';

import { SuccessfulExpressMiddleware } from '../../middlewares/express/SuccessfulExpressMiddleware';
import { UnsuccessfulExpressMiddleware } from '../../middlewares/express/UnsuccessfulExpressMiddleware';

@Controller('/warriors')
export class WarriorsDeleteUnsuccessfulExpressMiddlewareController {
  @ApplyMiddleware(SuccessfulExpressMiddleware, UnsuccessfulExpressMiddleware)
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
