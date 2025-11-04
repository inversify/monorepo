import { Readable } from 'node:stream';

import { Controller, Patch } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPatchStreamController {
  @Patch()
  public async patchWarrior(): Promise<Readable> {
    const streamContent: string = 'this is the content of the stream';
    return Readable.from(Buffer.from(streamContent));
  }
}
