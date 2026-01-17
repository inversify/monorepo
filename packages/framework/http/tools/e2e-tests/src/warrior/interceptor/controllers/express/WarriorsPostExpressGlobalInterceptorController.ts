import { Controller, Post } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPostExpressGlobalInterceptorController {
  @Post()
  public async postWarrior(): Promise<void> {}
}
