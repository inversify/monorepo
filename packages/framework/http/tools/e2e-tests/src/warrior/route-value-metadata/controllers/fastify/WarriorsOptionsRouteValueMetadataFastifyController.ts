import { ApplyMiddleware, Controller, Options } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/fastifyRoles.js';
import { RouteValueMetadataFastifyMiddleware } from '../../middlewares/fastify/RouteValueMetadataFastifyMiddleware.js';

@Controller('/warriors')
export class WarriorsOptionsRouteValueMetadataFastifyController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataFastifyMiddleware)
  @Options()
  public async optionsWarrior(): Promise<void> {}
}
