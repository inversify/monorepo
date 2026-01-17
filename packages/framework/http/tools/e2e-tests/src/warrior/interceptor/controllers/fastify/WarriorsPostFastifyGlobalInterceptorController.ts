import { Controller, Post } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPostFastifyGlobalInterceptorController {
  @Post()
  public async postWarrior(): Promise<void> {}
}
