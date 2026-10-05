import { ApplyMiddleware, Controller, Delete } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/honoRoles.js';
import { RouteValueMetadataHonoMiddleware } from '../../middlewares/hono/RouteValueMetadataHonoMiddleware.js';

@Controller('/warriors')
export class WarriorsDeleteRouteValueMetadataHonoController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataHonoMiddleware)
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
