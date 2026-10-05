import { ApplyMiddleware, Controller, Post } from '@inversifyjs/http-core';

import { SuccessfulFastifyMiddleware } from '../../middlewares/fastify/SuccessfulFastifyMiddleware.js';

@Controller('/warriors')
export class WarriorsPostSuccessfulFastifyMiddlewareController {
  @ApplyMiddleware(SuccessfulFastifyMiddleware)
  @Post()
  public async postWarrior(): Promise<void> {}
}
