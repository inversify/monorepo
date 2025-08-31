import { HttpStatusCode, Middleware } from '@inversifyjs/http-core';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import { injectable } from 'inversify';

@injectable()
export class UnsuccessfulFastifyMiddleware
  implements
    Middleware<FastifyRequest, FastifyReply, HookHandlerDoneFunction, void>
{
  public async execute(
    _request: FastifyRequest,
    response: FastifyReply,
    _next: HookHandlerDoneFunction,
  ): Promise<void> {
    response.status(HttpStatusCode.FORBIDDEN).send();
  }
}
