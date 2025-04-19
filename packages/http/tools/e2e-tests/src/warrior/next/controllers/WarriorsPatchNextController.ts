import { controller, next, PATCH } from '@inversifyjs/http-core';

@controller('warriors')
export class WarriorsPatchNextController {
  @PATCH()
  public async patchWarrior(@next() nextFn: () => void): Promise<void> {
    nextFn();
  }
}
