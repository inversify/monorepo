import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';

import { SuccessfulFastifyMiddleware } from '../../middlewares/fastify/SuccessfulFastifyMiddleware';
import { UnsuccessfulFastifyMiddleware } from '../../middlewares/fastify/UnsuccessfulFastifyMiddleware';

@Controller('/warriors')
export class WarriorsGetUnsuccessfulFastifyMiddlewareController {
  @ApplyMiddleware(SuccessfulFastifyMiddleware, UnsuccessfulFastifyMiddleware)
  @Get()
  public async getWarrior(): Promise<void> {}
}
