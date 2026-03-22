import { ApplyMiddleware, Controller, Post } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/fastifyRoles';
import { RouteValueMetadataFastifyMiddleware } from '../../middlewares/fastify/RouteValueMetadataFastifyMiddleware';

@Controller('/warriors')
export class WarriorsPostRouteValueMetadataFastifyController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataFastifyMiddleware)
  @Post()
  public async postWarrior(): Promise<void> {}
}
