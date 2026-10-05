import { ApplyMiddleware, Controller, Patch } from '@inversifyjs/http-core';

import { Roles } from '../../decorators/express4Roles.js';
import { RouteValueMetadataExpressV4Middleware } from '../../middlewares/express4/RouteValueMetadataExpressV4Middleware.js';

@Controller('/warriors')
export class WarriorsPatchRouteValueMetadataExpressV4Controller {
  @Roles(['admin', 'user'])
  @ApplyMiddleware(RouteValueMetadataExpressV4Middleware)
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
