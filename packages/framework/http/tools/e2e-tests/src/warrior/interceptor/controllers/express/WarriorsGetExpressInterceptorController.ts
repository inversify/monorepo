import { Controller, Get, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteExpressInterceptor } from '../../interceptors/express/WarriorRouteExpressInterceptor.js';

@Controller('/warriors')
@UseInterceptor(WarriorRouteExpressInterceptor)
export class WarriorsGetExpressInterceptorController {
  @Get()
  public async getWarrior(): Promise<void> {}
}
