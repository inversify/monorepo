import { Controller, Delete, UseGuard } from '@inversifyjs/http-core';

import { SuccessfulGuard } from '../guards/SuccessfulGuard';

@Controller('/warriors')
export class WarriorsDeleteSuccessfulGuardController {
  @UseGuard(SuccessfulGuard)
  @Delete()
  public async deleteWarrior(): Promise<void> {}
}
