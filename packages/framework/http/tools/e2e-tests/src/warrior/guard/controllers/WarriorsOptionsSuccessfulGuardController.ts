import { Controller, Options, UseGuard } from '@inversifyjs/http-core';

import { SuccessfulGuard } from '../guards/SuccessfulGuard';

@Controller('/warriors')
export class WarriorsOptionsSuccessfulGuardController {
  @UseGuard(SuccessfulGuard)
  @Options()
  public async optionsWarrior(): Promise<void> {}
}
