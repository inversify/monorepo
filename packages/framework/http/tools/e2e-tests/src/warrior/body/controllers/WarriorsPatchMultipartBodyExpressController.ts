import { Body, Controller, Patch } from '@inversifyjs/http-core';

import { WarriorCreationResponse } from '../models/WarriorCreationResponse';
import { WarriorCreationResponseType } from '../models/WarriorCreationResponseType';

@Controller('/warriors')
export class WarriorsPatchMultipartBodyExpressController {
  @Patch()
  public async updateWarrior(
    @Body() body: Record<string, string>,
  ): Promise<WarriorCreationResponse> {
    return {
      damage: 10,
      health: 100,
      name: body['name'] as string,
      range: 1,
      speed: 10,
      type: body['type'] as WarriorCreationResponseType,
    };
  }
}
