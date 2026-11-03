import { HttpStatusCode } from '@inversifyjs/http-core';
import { type HonoMiddleware } from '@inversifyjs/http-hono';
import { type Context, type HonoRequest, type Next } from 'hono';
import { injectable } from 'inversify';

@injectable()
export class UnsuccessfulHonoMiddleware implements HonoMiddleware {
  public async execute(
    _request: HonoRequest,
    response: Context,
    _next: Next,
  ): Promise<Response> {
    response.status(HttpStatusCode.FORBIDDEN);

    return response.json(undefined);
  }
}
