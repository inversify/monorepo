import { Controller, Options, UseGuard } from '@inversifyjs/http-core';

import { UnsuccessfulGuard } from '../guards/UnsuccessfulGuard.js';

@Controller('/warriors')
export class WarriorsOptionsUnsuccessfulGuardController {
  @UseGuard(UnsuccessfulGuard)
  @Options()
  public async optionsWarrior(): Promise<void> {}
}
