import { HttpStatusCode } from '@inversifyjs/http-core';
import { UwebSocketsMiddleware } from '@inversifyjs/http-uwebsockets';
import { injectable } from 'inversify';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';

@injectable()
export class UnsuccessfulUwebSocketsMiddleware implements UwebSocketsMiddleware {
  public async execute(
    _request: HttpRequest,
    response: HttpResponse,
    _next: () => void,
  ): Promise<void> {
    response.cork(() => {
      response.writeStatus(HttpStatusCode.FORBIDDEN.toString());
      response.writeHeader('x-test-header', 'test-value');
      response.end();
    });
  }
}
