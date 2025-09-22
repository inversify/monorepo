import { HonoMiddleware } from '@inversifyjs/http-hono';
import { Context, HonoRequest } from 'hono';
import { injectable } from 'inversify';

@injectable()
export class NextHonoMiddleware implements HonoMiddleware {
  public async execute(
    _request: HonoRequest,
    context: Context,
  ): Promise<Response | undefined> {
    // DO NOT call next(), the adapter is already calling it

    // https://hono.dev/docs/guides/middleware#modify-the-response-after-next

    context.res = new Response(undefined, {
      status: 200,
    });

    return undefined;
  }
}
