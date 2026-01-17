import { Controller, Post } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPostHonoGlobalInterceptorController {
  @Post()
  public async postWarrior(): Promise<void> {}
}
