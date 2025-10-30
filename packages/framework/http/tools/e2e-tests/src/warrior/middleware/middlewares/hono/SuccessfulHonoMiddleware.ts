import { HonoMiddleware } from '@inversifyjs/http-hono';
import { Context, HonoRequest, Next } from 'hono';
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
