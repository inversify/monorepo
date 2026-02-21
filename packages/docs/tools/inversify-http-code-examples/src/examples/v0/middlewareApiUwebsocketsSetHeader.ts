import { type UwebSocketsMiddleware } from '@inversifyjs/http-uwebsockets';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

// Begin-example
export class UwebsocketsCustomHeaderMiddleware implements UwebSocketsMiddleware {
  public execute(
    _request: HttpRequest,
    response: HttpResponse,
    next: () => void,
  ): void {
    response.cork((): void => {
      response.writeHeader('custom-header', 'value');
    });
    next();
  }
}
// End-example
