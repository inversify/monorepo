import { Controller, Get, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteExpressInterceptor } from '../../interceptors/express/WarriorRouteExpressInterceptor';

@Controller('/warriors')
@UseInterceptor(WarriorRouteExpressInterceptor)
export class WarriorsGetExpressInterceptorController {
  @Get()
  public async getWarrior(): Promise<void> {}
}
