import { Controller, Get, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteExpressV4Interceptor } from '../../interceptors/express4/WarriorRouteExpressV4Interceptor';

@Controller('/warriors')
@UseInterceptor(WarriorRouteExpressV4Interceptor)
export class WarriorsGetExpress4InterceptorController {
  @Get()
  public async getWarrior(): Promise<void> {}
}
