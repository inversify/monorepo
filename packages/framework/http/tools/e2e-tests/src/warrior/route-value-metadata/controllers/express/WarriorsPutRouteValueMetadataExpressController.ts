import { ApplyMiddleware, Controller, Put } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/expressRoles.js';
import { RouteValueMetadataExpressMiddleware } from '../../middlewares/express/RouteValueMetadataExpressMiddleware.js';

@Controller('/warriors')
export class WarriorsPutRouteValueMetadataExpressController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataExpressMiddleware)
  @Put()
  public async putWarrior(): Promise<void> {}
}
