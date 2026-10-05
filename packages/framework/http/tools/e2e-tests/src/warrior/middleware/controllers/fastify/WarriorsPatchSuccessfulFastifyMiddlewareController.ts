import { ApplyMiddleware, Controller, Patch } from '@inversifyjs/http-core';

import { SuccessfulFastifyMiddleware } from '../../middlewares/fastify/SuccessfulFastifyMiddleware.js';

@Controller('/warriors')
export class WarriorsPatchSuccessfulFastifyMiddlewareController {
  @ApplyMiddleware(SuccessfulFastifyMiddleware)
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
