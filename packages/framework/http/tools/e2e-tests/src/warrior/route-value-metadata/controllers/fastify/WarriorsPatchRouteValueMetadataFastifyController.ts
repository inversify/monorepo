import { ApplyMiddleware, Controller, Patch } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/fastifyRoles.js';
import { RouteValueMetadataFastifyMiddleware } from '../../middlewares/fastify/RouteValueMetadataFastifyMiddleware.js';

@Controller('/warriors')
export class WarriorsPatchRouteValueMetadataFastifyController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataFastifyMiddleware)
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
