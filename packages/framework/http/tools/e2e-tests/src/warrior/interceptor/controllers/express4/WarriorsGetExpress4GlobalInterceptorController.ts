import { Controller, Get } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsGetExpress4GlobalInterceptorController {
  @Get()
  public async getWarrior(): Promise<void> {}
}
