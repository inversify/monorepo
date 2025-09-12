import { Controller, Put, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteExpressV4Interceptor } from '../../interceptors/express4/WarriorRouteExpressV4Interceptor';

@Controller('/warriors')
@UseInterceptor(WarriorRouteExpressV4Interceptor)
export class WarriorsPutExpress4InterceptorController {
  @Put()
  public async putWarrior(): Promise<void> {}
}
