import { ApplyMiddleware, Controller, Delete } from '@inversifyjs/http-core';

import { SuccessfulExpressV4Middleware } from '../../middlewares/express4/SuccessfulExpressV4Middleware';

@Controller('/warriors')
export class WarriorsDeleteSuccessfulExpressV4MiddlewareController {
  @ApplyMiddleware(SuccessfulExpressV4Middleware)
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
