import { ApplyMiddleware, Controller, Put } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/fastifyRoles.js';
import { RouteValueMetadataFastifyMiddleware } from '../../middlewares/fastify/RouteValueMetadataFastifyMiddleware.js';

@Controller('/warriors')
export class WarriorsPutRouteValueMetadataFastifyController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataFastifyMiddleware)
  @Put()
  public async putWarrior(): Promise<void> {}
}
