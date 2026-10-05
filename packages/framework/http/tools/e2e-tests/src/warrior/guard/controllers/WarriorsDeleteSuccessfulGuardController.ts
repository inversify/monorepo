import { Controller, Delete, UseGuard } from '@inversifyjs/http-core';

import { SuccessfulGuard } from '../guards/SuccessfulGuard.js';

@Controller('/warriors')
export class WarriorsDeleteSuccessfulGuardController {
  @UseGuard(SuccessfulGuard)
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
