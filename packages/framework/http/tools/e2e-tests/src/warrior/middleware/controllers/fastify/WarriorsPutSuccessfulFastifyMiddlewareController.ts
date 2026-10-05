import { ApplyMiddleware, Controller, Put } from '@inversifyjs/http-core';

import { SuccessfulFastifyMiddleware } from '../../middlewares/fastify/SuccessfulFastifyMiddleware.js';

@Controller('/warriors')
export class WarriorsPutSuccessfulFastifyMiddlewareController {
  @ApplyMiddleware(SuccessfulFastifyMiddleware)
  @Put()
  public async putWarrior(): Promise<void> {}
}
