import { ForbiddenResponse, Guard } from '@inversifyjs/http-core';
import { HonoRequest } from 'hono';

// Begin-example
export class HonoDenyGuard implements Guard<HonoRequest> {
  public activate(_request: HonoRequest): boolean {
    throw new ForbiddenResponse('Missing or invalid credentials');
  }
}
// End-example
