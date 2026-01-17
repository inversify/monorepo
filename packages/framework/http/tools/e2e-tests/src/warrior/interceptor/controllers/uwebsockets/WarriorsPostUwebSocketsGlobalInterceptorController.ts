import { Controller, Post } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPostUwebSocketsGlobalInterceptorController {
  @Post()
  public async postWarrior(): Promise<void> {}
}
