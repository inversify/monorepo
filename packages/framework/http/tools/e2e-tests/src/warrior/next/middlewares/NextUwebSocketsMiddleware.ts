import { UwebSocketsMiddleware } from '@inversifyjs/http-uwebsockets';
import { injectable } from 'inversify';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';

@injectable()
export class NextUwebSocketsMiddleware implements UwebSocketsMiddleware {
  public async execute(
    _request: HttpRequest,
    response: HttpResponse,
  ): Promise<void> {
    response.end();
  }
}
