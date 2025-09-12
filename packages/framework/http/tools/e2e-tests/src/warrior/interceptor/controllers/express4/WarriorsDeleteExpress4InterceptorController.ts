import { Controller, Delete, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteExpressV4Interceptor } from '../../interceptors/express4/WarriorRouteExpressV4Interceptor';

@Controller('/warriors')
@UseInterceptor(WarriorRouteExpressV4Interceptor)
export class WarriorsDeleteExpress4InterceptorController {
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
