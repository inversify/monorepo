import { Guard } from '@inversifyjs/http-core';
import { type FastifyRequest } from 'fastify';

// Begin-example
export class FastifyAllowGuard implements Guard<FastifyRequest> {
  public async activate(_request: FastifyRequest): Promise<boolean> {
    return true;
  }
}
// End-example
