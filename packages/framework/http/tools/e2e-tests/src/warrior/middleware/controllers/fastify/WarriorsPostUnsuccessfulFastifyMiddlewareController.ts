import { ApplyMiddleware, Controller, Post } from '@inversifyjs/http-core';

import { SuccessfulFastifyMiddleware } from '../../middlewares/fastify/SuccessfulFastifyMiddleware.js';
import { UnsuccessfulFastifyMiddleware } from '../../middlewares/fastify/UnsuccessfulFastifyMiddleware.js';

@Controller('/warriors')
export class WarriorsPostUnsuccessfulFastifyMiddlewareController {
  @ApplyMiddleware(SuccessfulFastifyMiddleware, UnsuccessfulFastifyMiddleware)
  @Post()
  public async postWarrior(): Promise<void> {}
}
