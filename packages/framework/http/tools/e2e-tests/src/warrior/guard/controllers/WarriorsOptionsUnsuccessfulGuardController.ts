import { Controller, Options, UseGuard } from '@inversifyjs/http-core';

import { UnsuccessfulGuard } from '../guards/UnsuccessfulGuard';

@Controller('/warriors')
export class WarriorsOptionsUnsuccessfulGuardController {
  @UseGuard(UnsuccessfulGuard)
  @Options()
  public async optionsWarrior(): Promise<void> {}
}
