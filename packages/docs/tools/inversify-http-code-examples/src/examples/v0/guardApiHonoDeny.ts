import { ForbiddenHttpResponse, Guard } from '@inversifyjs/http-core';
import { type HonoRequest } from 'hono';

// Begin-example
export class HonoDenyGuard implements Guard<HonoRequest> {
  public activate(_request: HonoRequest): boolean {
    throw new ForbiddenHttpResponse(
      { message: 'Missing or invalid credentials' },
      'Missing or invalid credentials',
    );
  }
}
// End-example
