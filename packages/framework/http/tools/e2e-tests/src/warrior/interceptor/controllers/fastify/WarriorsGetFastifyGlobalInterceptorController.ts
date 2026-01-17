import { Controller, Get } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsGetFastifyGlobalInterceptorController {
  @Get()
  public async getWarrior(): Promise<void> {}
}
