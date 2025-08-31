import { Controller, Patch, UseGuard } from '@inversifyjs/http-core';

import { UnsuccessfulGuard } from '../guards/UnsuccessfulGuard';

@Controller('/warriors')
export class WarriorsPatchUnsuccessfulGuardController {
  @UseGuard(UnsuccessfulGuard)
  @Patch()
  public async patchWarrior(): Promise<void> {}
}
