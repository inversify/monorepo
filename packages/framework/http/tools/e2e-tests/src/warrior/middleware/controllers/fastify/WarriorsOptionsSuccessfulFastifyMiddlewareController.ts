import { ApplyMiddleware, Controller, Options } from '@inversifyjs/http-core';

import { SuccessfulFastifyMiddleware } from '../../middlewares/fastify/SuccessfulFastifyMiddleware.js';

@Controller('/warriors')
export class WarriorsOptionsSuccessfulFastifyMiddlewareController {
  @ApplyMiddleware(SuccessfulFastifyMiddleware)
  @Options()
  public async optionsWarrior(): Promise<void> {}
}
