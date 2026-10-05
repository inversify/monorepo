import { Controller, Post, Query } from '@inversifyjs/http-core';

import { WarriorWithQuery } from '../models/WarriorWithQuery.js';

@Controller('/warriors')
export class WarriorsPostQueryNamedController {
  @Post()
  public async postWarrior(
    @Query({
      name: 'filter',
    })
    filter: string,
  ): Promise<WarriorWithQuery> {
    return {
      damage: 10,
      filter,
      health: 100,
      range: 1,
      speed: 10,
    };
  }
}
