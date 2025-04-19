import { controller, DELETE, next } from '@inversifyjs/http-core';

@controller('warriors')
export class WarriorsDeleteNextController {
  @DELETE()
  public async deleteWarrior(@next() nextFn: () => void): Promise<void> {
    nextFn();
  }
}
