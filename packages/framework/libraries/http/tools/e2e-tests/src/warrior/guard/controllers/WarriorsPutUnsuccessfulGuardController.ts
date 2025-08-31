import { Controller, Put, UseGuard } from '@inversifyjs/http-core';

import { UnsuccessfulGuard } from '../guards/UnsuccessfulGuard';

@Controller('/warriors')
export class WarriorsPutUnsuccessfulGuardController {
  @UseGuard(UnsuccessfulGuard)
  @Put()
  public async putWarrior(): Promise<void> {}
}
