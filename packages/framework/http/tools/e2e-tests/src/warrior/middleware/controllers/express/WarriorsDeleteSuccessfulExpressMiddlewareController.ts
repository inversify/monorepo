import { ApplyMiddleware, Controller, Delete } from '@inversifyjs/http-core';

import { SuccessfulExpressMiddleware } from '../../middlewares/express/SuccessfulExpressMiddleware.js';

@Controller('/warriors')
export class WarriorsDeleteSuccessfulExpressMiddlewareController {
  @ApplyMiddleware(SuccessfulExpressMiddleware)
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
