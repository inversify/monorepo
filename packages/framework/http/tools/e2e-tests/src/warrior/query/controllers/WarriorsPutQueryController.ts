import { Controller, Put, Query } from '@inversifyjs/http-core';

import { WarriorWithQuery } from '../models/WarriorWithQuery';

@Controller('/warriors')
export class WarriorsPutQueryController {
  @Put()
  public async putWarrior(
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
