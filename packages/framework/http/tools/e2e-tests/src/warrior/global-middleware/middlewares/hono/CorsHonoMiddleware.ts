import { HonoMiddleware } from '@inversifyjs/http-hono';
import { Context, HonoRequest, Next } from 'hono';
import { injectable } from 'inversify';

@injectable()
export class CorsHonoMiddleware implements HonoMiddleware {
  public async execute(
    _request: HonoRequest,
    ctx: Context,
    next: Next,
  ): Promise<Response | undefined> {
    if (ctx.req.method === 'OPTIONS') {
      ctx.res = new Response(null, {
        headers: {
          'access-control-allow-headers': 'Content-Type, Authorization',
          'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'access-control-allow-origin': '*',
        },
        status: 204,
      });

      return ctx.res;
    }

    ctx.header('access-control-allow-origin', '*');

    await next();

    return undefined;
  }
}
