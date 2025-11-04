import { Readable } from 'node:stream';

import { Controller, Post } from '@inversifyjs/http-core';

@Controller('/warriors')
export class WarriorsPostStreamController {
  @Post()
  public async createWarrior(): Promise<Readable> {
    const streamContent: string = 'this is the content of the stream';
    return Readable.from(Buffer.from(streamContent));
  }
}
