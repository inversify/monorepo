import { ForbiddenResponse, Guard } from '@inversifyjs/http-core';
import { FastifyRequest } from 'fastify';

// Begin-example
export class FastifyDenyGuard implements Guard<FastifyRequest> {
  public activate(_request: FastifyRequest): boolean {
    throw new ForbiddenResponse('Missing or invalid credentials');
  }
}
// End-example
