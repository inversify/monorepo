import { Controller, Put, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteUwebSocketsInterceptor } from '../../interceptors/uwebsockets/WarriorRouteUwebSocketsInterceptor.js';

@Controller('/warriors')
@UseInterceptor(WarriorRouteUwebSocketsInterceptor)
export class WarriorsPutUwebSocketsInterceptorController {
  @Put()
  public async putWarrior(): Promise<void> {}
}
