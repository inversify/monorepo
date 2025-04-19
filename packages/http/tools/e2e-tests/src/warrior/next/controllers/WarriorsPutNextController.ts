import { controller, next, PUT } from '@inversifyjs/http-core';

@controller('warriors')
export class WarriorsPutNextController {
  @PUT()
  public async putWarrior(@next() nextFn: () => void): Promise<void> {
    nextFn();
  }
}
