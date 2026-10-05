import { ApplyMiddleware, Controller, Patch } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/expressRoles.js';
import { RouteValueMetadataExpressMiddleware } from '../../middlewares/express/RouteValueMetadataExpressMiddleware.js';

@Controller('/warriors')
export class WarriorsPatchRouteValueMetadataExpressController {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataExpressMiddleware)
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
