import { UwebSocketsMiddleware } from '@inversifyjs/http-uwebsockets';
import { injectable } from 'inversify';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';

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
