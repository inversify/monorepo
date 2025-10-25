import { Controller, Get, Response } from '@inversifyjs/http-core';
import { type FastifyReply } from 'fastify';

// Begin-example
@Controller('/message')
export class ResponseFastifyController {
  @Get()
  public async sendMessage(@Response() reply: FastifyReply): Promise<void> {
    reply.send({ message: 'hello' });
  }
}
