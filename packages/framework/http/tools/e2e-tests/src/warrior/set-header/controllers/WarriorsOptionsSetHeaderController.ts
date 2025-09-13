import { Controller, Options, SetHeader } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsOptionsSetHeaderController {
  @SetHeader('x-test-header', 'test-value')
  @Options()
  public async optionsWarrior(): Promise<void> {}
}
