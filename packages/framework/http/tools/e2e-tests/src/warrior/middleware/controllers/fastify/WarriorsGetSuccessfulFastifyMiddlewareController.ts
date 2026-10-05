import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';

import { SuccessfulFastifyMiddleware } from '../../middlewares/fastify/SuccessfulFastifyMiddleware.js';

@Controller('/warriors')
export class WarriorsGetSuccessfulFastifyMiddlewareController {
  @ApplyMiddleware(SuccessfulFastifyMiddleware)
  @Get()
  public async getWarrior(): Promise<void> {}
}
