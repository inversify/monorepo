import { controller, next, POST } from '@inversifyjs/http-core';

@controller('warriors')
export class WarriorsPostNextController {
  @POST()
  public async postWarrior(@next() nextFn: () => void): Promise<void> {
    nextFn();
  }
}
