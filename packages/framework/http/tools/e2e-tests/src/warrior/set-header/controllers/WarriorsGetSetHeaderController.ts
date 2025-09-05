import { Controller, Get, SetHeader } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsGetSetHeaderController {
  @SetHeader('x-test-header', 'test-value')
  @Get()
  public async getWarrior(): Promise<void> {}
}
