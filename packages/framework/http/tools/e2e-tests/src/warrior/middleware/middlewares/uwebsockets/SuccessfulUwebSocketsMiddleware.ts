import { type UwebSocketsMiddleware } from '@inversifyjs/http-uwebsockets';
import { injectable } from 'inversify';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

@injectable()
export class SuccessfulUwebSocketsMiddleware implements UwebSocketsMiddleware {
  public async execute(
    _request: HttpRequest,
    response: HttpResponse,
    next: () => void,
  ): Promise<undefined> {
    response.writeHeader('x-test-header', 'test-value');

    next();
  }
}
