import { HttpStatusCode, type Middleware } from '@inversifyjs/http-core';
import { type FastifyReply, type FastifyRequest } from 'fastify';
import { injectable } from 'inversify';

@injectable()
export class UnsuccessfulFastifyMiddleware implements Middleware<
  FastifyRequest,
  FastifyReply,
  () => void,
  void
> {
  public async execute(
    _request: FastifyRequest,
    response: FastifyReply,
    _next: () => void,
  ): Promise<void> {
    response.status(HttpStatusCode.FORBIDDEN).send();
  }
}
