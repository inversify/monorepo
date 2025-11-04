import { Controller, Get, Response } from '@inversifyjs/http-core';
import { type HttpResponse } from 'uWebSockets.js';

// Begin-example
@Controller('/message')
export class ResponseUwebsocketsController {
  @Get()
  public sendMessage(@Response() response: HttpResponse): void {
    response.cork((): void => {
      response.writeHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({ message: 'hello' }));
    });
  }
}
