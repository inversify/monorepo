import { Controller, Post, UseGuard } from '@inversifyjs/http-core';

import { UnsuccessfulGuard } from '../guards/UnsuccessfulGuard.js';

@Controller('/warriors')
export class WarriorsPostUnsuccessfulGuardController {
  @UseGuard(UnsuccessfulGuard)
  @Post()
  public async postWarrior(): Promise<void> {}
}
