import { ApplyMiddleware, Controller, Options } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/honoRoles.js';
import { RouteValueMetadataHonoMiddleware } from '../../middlewares/hono/RouteValueMetadataHonoMiddleware.js';

@Controller('/warriors')
export class WarriorsOptionsRouteValueMetadataHonoController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataHonoMiddleware)
  @Options()
  public async optionsWarrior(): Promise<void> {}
}
