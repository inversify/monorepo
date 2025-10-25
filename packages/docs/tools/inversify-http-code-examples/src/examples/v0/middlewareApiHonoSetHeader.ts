import { HonoMiddleware } from '@inversifyjs/http-hono';
import { type Context, type HonoRequest, Next } from 'hono';

// Begin-example
export class HonoCustomHeaderMiddleware implements HonoMiddleware {
  public async execute(
    _request: HonoRequest,
    response: Context,
    next: Next,
  ): Promise<Response | undefined> {
    response.header('custom-header', 'value');
    await next();
    return undefined;
  }
}
// End-example
