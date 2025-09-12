import { Controller, Delete, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteExpressInterceptor } from '../../interceptors/express/WarriorRouteExpressInterceptor';

@Controller('/warriors')
@UseInterceptor(WarriorRouteExpressInterceptor)
export class WarriorsDeleteExpressInterceptorController {
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
