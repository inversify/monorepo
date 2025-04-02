import { controller, params, POST } from '@inversifyjs/http-core';

@controller('/warriors')
export class WarriorsPostParamIdController {
  @POST('/:id')
  public async getWarrior(@params('id') id: string): Promise<string> {
    return id;
  }
}
