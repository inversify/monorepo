import { Controller, Post, SetHeader } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPostSetHeaderController {
  @SetHeader('x-test-header', 'test-value')
  @Post()
  public async createWarrior(): Promise<void> {}
}
