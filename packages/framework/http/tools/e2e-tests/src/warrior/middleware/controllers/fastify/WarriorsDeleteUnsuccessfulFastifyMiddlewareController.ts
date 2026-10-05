import { ApplyMiddleware, Controller, Delete } from '@inversifyjs/http-core';

import { SuccessfulFastifyMiddleware } from '../../middlewares/fastify/SuccessfulFastifyMiddleware.js';
import { UnsuccessfulFastifyMiddleware } from '../../middlewares/fastify/UnsuccessfulFastifyMiddleware.js';

@Controller('/warriors')
export class WarriorsDeleteUnsuccessfulFastifyMiddlewareController {
  @ApplyMiddleware(SuccessfulFastifyMiddleware, UnsuccessfulFastifyMiddleware)
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
