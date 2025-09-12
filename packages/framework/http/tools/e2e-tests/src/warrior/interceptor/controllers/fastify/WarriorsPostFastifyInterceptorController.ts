import { Controller, Post, UseInterceptor } from '@inversifyjs/http-core';

import { WarriorRouteFastifyInterceptor } from '../../interceptors/fastify/WarriorRouteFastifyInterceptor';

@Controller('/warriors')
@UseInterceptor(WarriorRouteFastifyInterceptor)
export class WarriorsPostFastifyInterceptorController {
  @Post()
  public async postWarrior(): Promise<void> {}
}
