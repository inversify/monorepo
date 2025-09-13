import { ApplyMiddleware, Controller, Delete } from '@inversifyjs/http-core';

import { SuccessfulFastifyMiddleware } from '../../middlewares/fastify/SuccessfulFastifyMiddleware';

@Controller('/warriors')
export class WarriorsDeleteSuccessfulFastifyMiddlewareController {
  @ApplyMiddleware(SuccessfulFastifyMiddleware)
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
