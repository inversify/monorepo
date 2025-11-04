import { Controller, Get, Request } from '@inversifyjs/http-core';
import { type HttpRequest } from 'uWebSockets.js';

// Begin-example
@Controller('/headers')
export class RequestUwebsocketsController {
  @Get()
  public async readHeader(@Request() request: HttpRequest): Promise<string> {
    const value: string = request.getHeader('x-test-header');

    return value;
  }
}
