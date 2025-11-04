import { Readable } from 'node:stream';

import { Controller, Get } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsGetStreamController {
  @Get()
  public async getWarrior(): Promise<Readable> {
    const streamContent: string = 'this is the content of the stream';
    return Readable.from(Buffer.from(streamContent));
  }
}
