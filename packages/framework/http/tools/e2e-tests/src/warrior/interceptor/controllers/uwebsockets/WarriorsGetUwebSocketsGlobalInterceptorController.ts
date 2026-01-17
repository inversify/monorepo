import { Controller, Get } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsGetUwebSocketsGlobalInterceptorController {
  @Get()
  public async getWarrior(): Promise<void> {}
}
