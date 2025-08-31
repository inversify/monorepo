import { Controller, Patch } from '@inversifyjs/http-core';

import { Warrior } from '../../common/models/Warrior';

@Controller('/warriors')
export class WarriorsPatchController {
  @Patch()
  public async updateWarrior(): Promise<Warrior> {
    return {
      damage: 10,
      health: 100,
      range: 1,
      speed: 10,
    };
  }
}
