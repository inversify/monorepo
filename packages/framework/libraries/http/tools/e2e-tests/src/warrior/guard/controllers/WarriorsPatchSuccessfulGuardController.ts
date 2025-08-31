import { Controller, Patch, UseGuard } from '@inversifyjs/http-core';

import { SuccessfulGuard } from '../guards/SuccessfulGuard';

@Controller('/warriors')
export class WarriorsPatchSuccessfulGuardController {
  @UseGuard(SuccessfulGuard)
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
