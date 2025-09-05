import { Controller, Get, UseGuard } from '@inversifyjs/http-core';

import { SuccessfulGuard } from '../guards/SuccessfulGuard';

@Controller('/warriors')
export class WarriorsGetSuccessfulGuardController {
  @UseGuard(SuccessfulGuard)
  @Get()
  public async getWarrior(): Promise<void> {}
}
