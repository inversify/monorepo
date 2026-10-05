import { Controller, Delete, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteUwebSocketsInterceptor } from '../../interceptors/uwebsockets/WarriorRouteUwebSocketsInterceptor.js';

@Controller('/warriors')
@UseInterceptor(WarriorRouteUwebSocketsInterceptor)
export class WarriorsDeleteUwebSocketsInterceptorController {
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
