import { ApplyMiddleware, Controller, Delete } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/express4Roles';
import { RouteValueMetadataExpressV4Middleware } from '../../middlewares/express4/RouteValueMetadataExpressV4Middleware';

@Controller('/warriors')
export class WarriorsDeleteRouteValueMetadataExpressV4Controller {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataExpressV4Middleware)
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
