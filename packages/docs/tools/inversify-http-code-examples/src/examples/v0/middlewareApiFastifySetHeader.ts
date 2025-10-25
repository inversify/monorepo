import { FastifyMiddleware } from '@inversifyjs/http-fastify';
import {
  type FastifyReply,
  type FastifyRequest,
  type HookHandlerDoneFunction,
} from 'fastify';

// Begin-example
export class FastifyCustomHeaderMiddleware implements FastifyMiddleware {
  public execute(
    _request: FastifyRequest,
    response: FastifyReply,
    next: HookHandlerDoneFunction,
  ): void {
    response.header('custom-header', 'value');
    next();
  }
}
// End-example
