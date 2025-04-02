import { controller, params, PATCH } from '@inversifyjs/http-core';

@controller('/warriors')
export class WarriorsPatchParamIdController {
  @PATCH('/:id')
  public async getWarrior(@params('id') id: string): Promise<string> {
    return id;
  }
}
