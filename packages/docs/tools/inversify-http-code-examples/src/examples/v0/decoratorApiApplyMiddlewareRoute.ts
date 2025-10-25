import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';
import { HonoMiddleware } from '@inversifyjs/http-hono';
import { type Context, type HonoRequest, type Next } from 'hono';

export class MyMiddleware implements HonoMiddleware {
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

// Begin-example
@Controller('/ping')
class PingController {
  @ApplyMiddleware(MyMiddleware)
  @Get()
  public async get(): Promise<string> {
    return 'pong';
  }
}
// End-example

export { PingController };
