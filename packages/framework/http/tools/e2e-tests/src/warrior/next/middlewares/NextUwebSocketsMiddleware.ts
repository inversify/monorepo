import { type UwebSocketsMiddleware } from '@inversifyjs/http-uwebsockets';
import { injectable } from 'inversify';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

@injectable()
export class NextUwebSocketsMiddleware implements UwebSocketsMiddleware {
  public async execute(
    _request: HttpRequest,
    response: HttpResponse,
  ): Promise<void> {
    response.end();
  }
}
