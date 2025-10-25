import { Controller, Get, Request } from '@inversifyjs/http-core';
import { type HonoRequest } from 'hono';

// Begin-example
@Controller('/headers')
export class RequestHonoController {
  @Get()
  public async readHeader(@Request() request: HonoRequest): Promise<string> {
    const value: string | undefined = request.header('x-test-header');

    return value ?? '';
  }
}
