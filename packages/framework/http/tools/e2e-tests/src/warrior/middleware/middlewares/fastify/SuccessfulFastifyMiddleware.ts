import { Middleware } from '@inversifyjs/http-core';
import { FastifyReply, FastifyRequest } from 'fastify';
import { injectable } from 'inversify';

@injectable()
export class SuccessfulFastifyMiddleware implements Middleware<
  FastifyRequest,
  FastifyReply,
  () => void,
  void
> {
  public async execute(
    _request: FastifyRequest,
    response: FastifyReply,
    next: () => void,
  ): Promise<void> {
    response.header('x-test-header', 'test-value');

    next();
  }
}
