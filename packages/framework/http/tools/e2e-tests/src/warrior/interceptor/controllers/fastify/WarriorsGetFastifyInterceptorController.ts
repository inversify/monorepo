import { Controller, Get, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteFastifyInterceptor } from '../../interceptors/fastify/WarriorRouteFastifyInterceptor';

@Controller('/warriors')
@UseInterceptor(WarriorRouteFastifyInterceptor)
export class WarriorsGetFastifyInterceptorController {
  @Get()
  public async getWarrior(): Promise<void> {}
}
