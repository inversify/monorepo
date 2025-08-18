import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';
import { HonoMiddleware } from '@inversifyjs/http-hono';
import { Context, HonoRequest, Next as HonoNext } from 'hono';

export class HonoNextMiddleware implements HonoMiddleware {
  public async execute(
    _request: HonoRequest,
    context: Context,
    next: HonoNext,
  ): Promise<Response | undefined> {
    context.header('next-was-called', 'true');
    await next();
    return undefined;
  }
}

// Begin-example
@Controller('/next')
export class NextHonoController {
  @ApplyMiddleware(HonoNextMiddleware)
  @Get()
  public async getNext(): Promise<string> {
    return 'ok';
  }
}
// End-example
