import { Controller, Get } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsGetHonoGlobalInterceptorController {
  @Get()
  public async getWarrior(): Promise<void> {}
}
