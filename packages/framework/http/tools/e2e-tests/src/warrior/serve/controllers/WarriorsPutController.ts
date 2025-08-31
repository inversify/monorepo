import { Controller, Put } from '@inversifyjs/http-core';

import { Warrior } from '../../common/models/Warrior';

@Controller('/warriors')
export class WarriorsPutController {
  @Put()
  public async updateWarrior(): Promise<Warrior> {
    return {
      damage: 10,
      health: 100,
      range: 1,
      speed: 10,
    };
  }
}
