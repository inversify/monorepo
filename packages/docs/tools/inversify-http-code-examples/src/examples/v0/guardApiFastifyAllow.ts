import { FastifyGuard } from '@inversifyjs/http-fastify';
import { type FastifyRequest } from 'fastify';

// Begin-example
export class FastifyAllowGuard implements FastifyGuard {
  public async activate(_request: FastifyRequest): Promise<boolean> {
    return true;
  }
}
// End-example
