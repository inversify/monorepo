import { Controller, Delete, UseGuard } from '@inversifyjs/http-core';

import { UnsuccessfulGuard } from '../guards/UnsuccessfulGuard';

@Controller('/warriors')
export class WarriorsDeleteUnsuccessfulGuardController {
  @UseGuard(UnsuccessfulGuard)
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
