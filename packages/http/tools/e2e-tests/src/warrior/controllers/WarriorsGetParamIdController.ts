import { controller, GET, params } from '@inversifyjs/http-core';

@controller('/warriors')
export class WarriorsGetParamIdController {
  @GET('/:id')
  public async getWarrior(@params('id') id: string): Promise<string> {
    return id;
  }
}
