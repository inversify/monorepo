import { Middleware } from '@inversifyjs/http-core';
import { Context, HonoRequest, Next } from 'hono';
import { injectable } from 'inversify';

@injectable()
export class SuccessfulHonoMiddleware
  implements Middleware<HonoRequest, Context, Next, void>
{
  public async execute(
    _request: HonoRequest,
    response: Context,
    next: Next,
  ): Promise<void> {
    response.header('x-test-header', 'test-value');

    await next();
  }
}
