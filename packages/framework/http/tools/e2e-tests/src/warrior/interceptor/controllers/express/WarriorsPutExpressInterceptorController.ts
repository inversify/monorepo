import { Controller, Put, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteExpressInterceptor } from '../../interceptors/express/WarriorRouteExpressInterceptor.js';

@Controller('/warriors')
@UseInterceptor(WarriorRouteExpressInterceptor)
export class WarriorsPutExpressInterceptorController {
  @Put()
  public async putWarrior(): Promise<void> {}
}
