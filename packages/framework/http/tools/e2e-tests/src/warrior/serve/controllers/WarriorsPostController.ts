import { Controller, Post } from '@inversifyjs/http-core';

import { Warrior } from '../../common/models/Warrior';

@Controller('/warriors')
export class WarriorsPostController {
  @Post()
  public async createWarrior(): Promise<Warrior> {
    return {
      damage: 10,
      health: 100,
      range: 1,
      speed: 10,
    };
  }
}
