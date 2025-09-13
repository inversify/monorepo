import { Controller, Delete } from '@inversifyjs/http-core';

import { Warrior } from '../../common/models/Warrior';

@Controller('/warriors')
export class WarriorsDeleteController {
  @Delete()
  public async deleteWarrior(): Promise<Warrior> {
    return {
      damage: 10,
      health: 100,
      range: 1,
      speed: 10,
    };
  }
}
