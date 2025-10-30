import { ForbiddenHttpResponse } from '@inversifyjs/http-core';
import { HonoGuard } from '@inversifyjs/http-hono';
import { type HonoRequest } from 'hono';

// Begin-example
export class HonoDenyGuard implements HonoGuard {
  public activate(_request: HonoRequest): boolean {
    throw new ForbiddenHttpResponse(
      { message: 'Missing or invalid credentials' },
      'Missing or invalid credentials',
    );
  }
}
// End-example
