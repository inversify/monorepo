// Begin-example
import { Controller, Get } from '@inversifyjs/http-core';
import { Context } from '@inversifyjs/http-hono';
import { type Context as HonoContext } from 'hono';

@Controller('/message')
export class ResponseHonoController {
  @Get()
  public async sendMessage(@Context() context: HonoContext): Promise<Response> {
    return context.json({ message: 'hello' });
  }
}
