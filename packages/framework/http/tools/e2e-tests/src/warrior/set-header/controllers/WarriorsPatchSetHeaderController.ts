import { Controller, Patch, SetHeader } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPatchSetHeaderController {
  @SetHeader('x-test-header', 'test-value')
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
