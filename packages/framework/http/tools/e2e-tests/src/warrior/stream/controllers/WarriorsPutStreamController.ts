import { Readable } from 'node:stream';

import { Controller, Put } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPutStreamController {
  @Put()
  public async putWarrior(): Promise<Readable> {
    const streamContent: string = 'this is the content of the stream';
    return Readable.from(Buffer.from(streamContent));
  }
}
