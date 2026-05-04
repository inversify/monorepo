import { UwebSocketsMiddleware } from '@inversifyjs/http-uwebsockets';
import { injectable } from 'inversify';
import { HttpRequest, HttpResponse, RecognizedString } from 'uWebSockets.js';

@injectable()
export class GlobalUwebSocketsMiddleware implements UwebSocketsMiddleware {
  public async execute(
    _request: HttpRequest,
    response: HttpResponse,
    next: () => void,
  ): Promise<undefined> {
    // uWebSockets requires writeStatus before writeHeader.
    // Patch end() so the header is injected after the status has been written
    // (the adapter writes status inside cork before calling end).
    const originalEnd: (
      body?: RecognizedString,
      closeConnection?: boolean,
    ) => HttpResponse = response.end.bind(response);

    (
      response as {
        end: (
          body?: RecognizedString,
          closeConnection?: boolean,
        ) => HttpResponse;
      }
    ).end = function (
      body?: RecognizedString,
      closeConnection?: boolean,
    ): HttpResponse {
      response.writeHeader('x-global', '1');

      return originalEnd(body, closeConnection);
    };

    next();

    return undefined;
  }
}
