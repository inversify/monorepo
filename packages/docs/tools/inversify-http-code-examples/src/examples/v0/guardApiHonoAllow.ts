import { HonoGuard } from '@inversifyjs/http-hono';
import { type HonoRequest } from 'hono';

// Begin-example
export class HonoAllowGuard implements HonoGuard {
  public async activate(_request: HonoRequest): Promise<boolean> {
    return true;
  }
}
// End-example
