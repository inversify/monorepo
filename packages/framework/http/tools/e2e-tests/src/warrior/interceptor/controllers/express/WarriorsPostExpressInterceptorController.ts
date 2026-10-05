import { Controller, Post, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteExpressInterceptor } from '../../interceptors/express/WarriorRouteExpressInterceptor.js';

@Controller('/warriors')
@UseInterceptor(WarriorRouteExpressInterceptor)
export class WarriorsPostExpressInterceptorController {
  @Post()
  public async postWarrior(): Promise<void> {}
}
