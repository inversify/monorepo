import { Controller, Get, Next, UseInterceptor } from '@inversifyjs/http-core';
import { FastifyInterceptor } from '@inversifyjs/http-fastify';
import {
  type FastifyReply,
  type FastifyRequest,
  type HookHandlerDoneFunction,
} from 'fastify';

export class FastifyNextInterceptor implements FastifyInterceptor {
  public async intercept(
    _request: FastifyRequest,
    reply: FastifyReply,
    next: () => Promise<unknown>,
  ): Promise<void> {
    reply.header('next-was-called', 'true');
    await next();
    reply.send('ok');
  }
}

// Begin-example
@Controller('/next')
@UseInterceptor(FastifyNextInterceptor)
export class NextFastifyController {
  @Get()
  public getNext(@Next() next: HookHandlerDoneFunction): void {
    next();
  }
}
// End-example
