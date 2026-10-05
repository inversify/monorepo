import { ApplyMiddleware, Controller, Delete } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/expressRoles.js';
import { RouteValueMetadataExpressMiddleware } from '../../middlewares/express/RouteValueMetadataExpressMiddleware.js';

@Controller('/warriors')
export class WarriorsDeleteRouteValueMetadataExpressController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataExpressMiddleware)
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
