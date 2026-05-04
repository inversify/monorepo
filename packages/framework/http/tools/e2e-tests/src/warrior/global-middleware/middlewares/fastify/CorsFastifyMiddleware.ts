import { HttpStatusCode, Middleware } from '@inversifyjs/http-core';
import { FastifyReply, FastifyRequest } from 'fastify';
import { injectable } from 'inversify';

@injectable()
export class CorsFastifyMiddleware implements Middleware<
  FastifyRequest,
  FastifyReply,
  () => void,
  void
> {
  public async execute(
    request: FastifyRequest,
    response: FastifyReply,
    next: () => void,
  ): Promise<void> {
    response.header('access-control-allow-origin', '*');
    response.header(
      'access-control-allow-methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    );
    response.header(
      'access-control-allow-headers',
      'Content-Type, Authorization',
    );

    if (request.method === 'OPTIONS') {
      await response.code(HttpStatusCode.NO_CONTENT).send('');
    } else {
      next();
    }
  }
}
