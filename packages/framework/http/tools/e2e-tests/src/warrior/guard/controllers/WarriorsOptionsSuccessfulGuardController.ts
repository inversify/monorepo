import { Controller, Options, UseGuard } from '@inversifyjs/http-core';

import { SuccessfulGuard } from '../guards/SuccessfulGuard.js';

@Controller('/warriors')
export class WarriorsOptionsSuccessfulGuardController {
  @UseGuard(SuccessfulGuard)
  @Options()
  public async optionsWarrior(): Promise<void> {}
}
