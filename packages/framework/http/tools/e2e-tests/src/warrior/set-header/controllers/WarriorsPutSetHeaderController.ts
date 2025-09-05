import { Controller, Put, SetHeader } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPutSetHeaderController {
  @SetHeader('x-test-header', 'test-value')
  @Put()
  public async updateWarrior(): Promise<void> {}
}
