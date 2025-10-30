import { ForbiddenHttpResponse } from '@inversifyjs/http-core';
import { FastifyGuard } from '@inversifyjs/http-fastify';
import { type FastifyRequest } from 'fastify';

// Begin-example
export class FastifyDenyGuard implements FastifyGuard {
  public activate(_request: FastifyRequest): boolean {
    throw new ForbiddenHttpResponse(
      { message: 'Missing or invalid credentials' },
      'Missing or invalid credentials',
    );
  }
}
// End-example
