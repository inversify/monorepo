import { type HonoMiddleware } from '@inversifyjs/http-hono';
import { type Context, type HonoRequest, type Next } from 'hono';
import { injectable } from 'inversify';

@injectable()
export class SuccessfulHonoMiddleware implements HonoMiddleware {
  public async execute(
    _request: HonoRequest,
    response: Context,
    next: Next,
  ): Promise<undefined> {
    response.header('x-test-header', 'test-value');

    await next();
  }
}
