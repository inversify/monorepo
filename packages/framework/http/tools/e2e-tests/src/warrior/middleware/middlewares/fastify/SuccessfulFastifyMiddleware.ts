import { Middleware } from '@inversifyjs/http-core';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import { injectable } from 'inversify';

@injectable()
export class SuccessfulFastifyMiddleware
  implements
    Middleware<FastifyRequest, FastifyReply, HookHandlerDoneFunction, void>
{
  public async execute(
    _request: FastifyRequest,
    response: FastifyReply,
    next: HookHandlerDoneFunction,
  ): Promise<void> {
    response.header('x-test-header', 'test-value');

    next();
  }
}
