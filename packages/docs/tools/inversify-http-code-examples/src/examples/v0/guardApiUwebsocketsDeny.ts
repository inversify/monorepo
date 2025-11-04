import { ForbiddenHttpResponse } from '@inversifyjs/http-core';
import { UwebSocketsGuard } from '@inversifyjs/http-uwebsockets';
import { type HttpRequest } from 'uWebSockets.js';

// Begin-example
export class UwebsocketsDenyGuard implements UwebSocketsGuard {
  public activate(_request: HttpRequest): boolean {
    throw new ForbiddenHttpResponse(
      { message: 'Missing or invalid credentials' },
      'Missing or invalid credentials',
    );
  }
}
// End-example
