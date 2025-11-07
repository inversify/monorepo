import { Body, Controller, Options } from '@inversifyjs/http-core';

import { WarriorCreationResponse } from '../models/WarriorCreationResponse';
import { WarriorRequest } from '../models/WarriorRequest';

@Controller('/warriors')
export class WarriorsOptionsUrlEncodedBodyController {
  @Options()
  public async optionsWarrior(
    @Body() body: WarriorRequest,
  ): Promise<WarriorCreationResponse> {
    return {
      damage: 10,
      health: 100,
      name: body.name,
      range: 1,
      speed: 10,
      type: body.type,
    };
  }
}
