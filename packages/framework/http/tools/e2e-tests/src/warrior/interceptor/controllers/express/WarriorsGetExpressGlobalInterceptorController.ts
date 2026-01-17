import { Controller, Get } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsGetExpressGlobalInterceptorController {
  @Get()
  public async getWarrior(): Promise<void> {}
}
