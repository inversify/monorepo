import { controller, OPTIONS, params } from '@inversifyjs/http-core';

@controller('/warriors')
export class WarriorsOptionsParamIdController {
  @OPTIONS('/:id')
  public async getWarrior(@params('id') id: string): Promise<string> {
    return id;
  }
}
