import { Controller, Post, Query } from '@inversifyjs/http-core';

import { WarriorWithQuery } from '../models/WarriorWithQuery';

@Controller('/warriors')
export class WarriorsPostQueryController {
  @Post()
  public async postWarrior(
    @Query() queryParams: { filter: string },
  ): Promise<WarriorWithQuery> {
    return {
      damage: 10,
      filter: queryParams.filter,
      health: 100,
      range: 1,
      speed: 10,
    };
  }
}
