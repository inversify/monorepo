import { Readable } from 'node:stream';

import { Controller, Options } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsOptionsStreamController {
  @Options()
  public async optionsWarrior(): Promise<Readable> {
    const streamContent: string = 'this is the content of the stream';
    return Readable.from(Buffer.from(streamContent));
  }
}
