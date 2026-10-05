import { Controller, Post, UseGuard } from '@inversifyjs/http-core';

import { SuccessfulGuard } from '../guards/SuccessfulGuard.js';

@Controller('/warriors')
export class WarriorsPostSuccessfulGuardController {
  @UseGuard(SuccessfulGuard)
  @Post()
  public async postWarrior(): Promise<void> {}
}
