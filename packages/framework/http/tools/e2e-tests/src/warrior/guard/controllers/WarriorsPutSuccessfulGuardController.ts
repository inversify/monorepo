import { Controller, Put, UseGuard } from '@inversifyjs/http-core';

import { SuccessfulGuard } from '../guards/SuccessfulGuard.js';

@Controller('/warriors')
export class WarriorsPutSuccessfulGuardController {
  @UseGuard(SuccessfulGuard)
  @Put()
  public async putWarrior(): Promise<void> {}
}
