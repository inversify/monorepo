import { Controller, Delete, Query } from '@inversifyjs/http-core';

import { WarriorWithQuery } from '../models/WarriorWithQuery';

@Controller('/warriors')
export class WarriorsDeleteQueryNamedController {
  @Delete()
  public async deleteWarrior(
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
