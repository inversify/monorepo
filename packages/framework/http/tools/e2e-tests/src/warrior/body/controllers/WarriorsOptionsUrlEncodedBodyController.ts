import { Body, Controller, Options } from '@inversifyjs/http-core';

import { type WarriorCreationResponse } from '../models/WarriorCreationResponse.js';
import { type WarriorRequest } from '../models/WarriorRequest.js';

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
