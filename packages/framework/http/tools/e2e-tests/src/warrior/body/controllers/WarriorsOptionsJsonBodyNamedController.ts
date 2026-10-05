import { Body, Controller, Options } from '@inversifyjs/http-core';

import { WarriorCreationResponse } from '../models/WarriorCreationResponse.js';
import { WarriorCreationResponseType } from '../models/WarriorCreationResponseType.js';

@Controller('/warriors')
export class WarriorsOptionsJsonBodyNamedController {
  @Options()
  public async optionsWarrior(
    @Body({
      name: 'name',
    })
    name: string,
  ): Promise<WarriorCreationResponse> {
    return {
      damage: 10,
      health: 100,
      name: name,
      range: 1,
      speed: 10,
      type: WarriorCreationResponseType.Melee,
    };
  }
}
