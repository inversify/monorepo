import { FastifyMiddleware } from '@inversifyjs/http-fastify';
import { type FastifyReply, type FastifyRequest } from 'fastify';

// Begin-example
export class FastifyCustomHeaderMiddleware implements FastifyMiddleware {
  public execute(
    _request: FastifyRequest,
    response: FastifyReply,
    next: () => void,
  ): void {
    response.header('custom-header', 'value');
    next();
  }
}
// End-example
