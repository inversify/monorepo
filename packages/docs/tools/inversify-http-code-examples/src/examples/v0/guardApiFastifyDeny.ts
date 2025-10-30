import { ForbiddenHttpResponse, Guard } from '@inversifyjs/http-core';
import { type FastifyRequest } from 'fastify';

// Begin-example
export class FastifyDenyGuard implements Guard<FastifyRequest> {
  public activate(_request: FastifyRequest): boolean {
    throw new ForbiddenHttpResponse(
      { message: 'Missing or invalid credentials' },
      'Missing or invalid credentials',
    );
  }
}
// End-example
