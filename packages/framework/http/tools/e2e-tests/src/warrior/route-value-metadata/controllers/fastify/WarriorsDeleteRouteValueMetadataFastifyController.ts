import { ApplyMiddleware, Controller, Delete } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/fastifyRoles.js';
import { RouteValueMetadataFastifyMiddleware } from '../../middlewares/fastify/RouteValueMetadataFastifyMiddleware.js';

@Controller('/warriors')
export class WarriorsDeleteRouteValueMetadataFastifyController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataFastifyMiddleware)
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
