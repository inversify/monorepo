import { Readable } from 'node:stream';

import { Controller, Delete } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsDeleteStreamController {
  @Delete()
  public async deleteWarrior(): Promise<Readable> {
    const streamContent: string = 'this is the content of the stream';
    return Readable.from(Buffer.from(streamContent));
  }
}
