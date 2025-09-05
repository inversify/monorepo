import { Controller, Get, UseGuard } from '@inversifyjs/http-core';

import { UnsuccessfulGuard } from '../guards/UnsuccessfulGuard';

@Controller('/warriors')
export class WarriorsGetUnsuccessfulGuardController {
  @UseGuard(UnsuccessfulGuard)
  @Get()
  public async getWarrior(): Promise<void> {}
}
