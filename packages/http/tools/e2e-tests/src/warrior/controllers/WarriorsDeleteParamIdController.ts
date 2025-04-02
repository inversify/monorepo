import { controller, DELETE, params } from '@inversifyjs/http-core';

@controller('/warriors')
export class WarriorsDeleteParamIdController {
  @DELETE('/:id')
  public async getWarrior(@params('id') id: string): Promise<string> {
    return id;
  }
}
