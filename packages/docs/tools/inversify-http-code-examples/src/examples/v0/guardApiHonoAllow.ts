import { Guard } from '@inversifyjs/http-core';
import { HonoRequest } from 'hono';

// Begin-example
export class HonoAllowGuard implements Guard<HonoRequest> {
  public async activate(_request: HonoRequest): Promise<boolean> {
    return true;
  }
}
// End-example
