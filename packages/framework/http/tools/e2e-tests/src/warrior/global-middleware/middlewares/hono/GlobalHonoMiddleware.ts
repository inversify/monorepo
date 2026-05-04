import { HonoMiddleware } from '@inversifyjs/http-hono';
import { Context, HonoRequest, Next } from 'hono';
import { injectable } from 'inversify';

@injectable()
export class GlobalHonoMiddleware implements HonoMiddleware {
  public async execute(
    _request: HonoRequest,
    response: Context,
    next: Next,
  ): Promise<undefined> {
    response.header('x-global', '1');

    await next();

    return undefined;
  }
}
