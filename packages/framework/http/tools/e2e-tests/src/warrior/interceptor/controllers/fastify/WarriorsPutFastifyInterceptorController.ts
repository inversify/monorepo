import { Controller, Put, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteFastifyInterceptor } from '../../interceptors/fastify/WarriorRouteFastifyInterceptor';

@Controller('/warriors')
@UseInterceptor(WarriorRouteFastifyInterceptor)
export class WarriorsPutFastifyInterceptorController {
  @Put()
  public async putWarrior(): Promise<void> {}
}
