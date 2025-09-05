import { HttpStatusCode, Middleware } from '@inversifyjs/http-core';
import { Context, HonoRequest, Next } from 'hono';
import { injectable } from 'inversify';

@injectable()
export class UnsuccessfulHonoMiddleware
  implements Middleware<HonoRequest, Context, Next, Response>
{
  public async execute(
    _request: HonoRequest,
    response: Context,
    _next: Next,
  ): Promise<Response> {
    response.status(HttpStatusCode.FORBIDDEN);

    return response.json(undefined);
  }
}
