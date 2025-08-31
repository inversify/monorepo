import { Controller, Get } from '@inversifyjs/http-core';

import { Warrior } from '../../common/models/Warrior';

@Controller('/warriors')
export class WarriorsGetController {
  @Get()
  public async getWarriors(): Promise<Warrior[]> {
    return [
      {
        damage: 10,
        health: 100,
        range: 1,
        speed: 10,
      },
    ];
  }
}
