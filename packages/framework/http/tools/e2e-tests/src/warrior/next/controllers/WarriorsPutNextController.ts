import { Controller, Next, Put } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPutNextController {
  @Put()
  public async putWarrior(@Next() nextFn: () => Promise<void>): Promise<void> {
    await nextFn();
  }
}
