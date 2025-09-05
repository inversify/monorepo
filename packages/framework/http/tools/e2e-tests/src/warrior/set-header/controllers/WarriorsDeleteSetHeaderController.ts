import { Controller, Delete, SetHeader } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsDeleteSetHeaderController {
  @SetHeader('x-test-header', 'test-value')
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
