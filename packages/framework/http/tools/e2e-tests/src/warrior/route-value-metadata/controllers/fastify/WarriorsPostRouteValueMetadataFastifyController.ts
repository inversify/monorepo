import { ApplyMiddleware, Controller, Post } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/fastifyRoles.js';
import { RouteValueMetadataFastifyMiddleware } from '../../middlewares/fastify/RouteValueMetadataFastifyMiddleware.js';

@Controller('/warriors')
export class WarriorsPostRouteValueMetadataFastifyController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataFastifyMiddleware)
  @Post()
  public async postWarrior(): Promise<void> {}
}
