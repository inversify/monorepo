import { type MiddlewareHandler } from '@inversifyjs/http-core';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

import { abortedSymbol } from '../data/abortedSymbol.js';
import { type CustomHttpResponse } from '../models/CustomHttpResponse.js';

type UwebSocketsMiddlewareHandler = MiddlewareHandler<
  HttpRequest,
  HttpResponse,
  () => void,
  void
>;

export function handleGlobalMiddlewareList(
  orderedHandlers: UwebSocketsMiddlewareHandler[],
): (request: HttpRequest, response: HttpResponse) => Promise<void> {
  return async (
    request: HttpRequest,
    response: HttpResponse,
  ): Promise<void> => {
    let currentIndex: number = 0;
    let [currentHandler]: UwebSocketsMiddlewareHandler[] = orderedHandlers;

    if (currentHandler === undefined) {
      throw new Error('No middleware handlers to process');
    }

    let nextCalled: boolean = false;

    const next: () => void = (): void => {
      nextCalled = true;
    };

    do {
      await currentHandler(request, response, next);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!nextCalled) {
        break;
      }

      nextCalled = false;

      currentHandler = orderedHandlers[++currentIndex];
    } while (currentHandler !== undefined);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (nextCalled) {
      if ((response as CustomHttpResponse)[abortedSymbol] !== true) {
        response.cork((): void => {
          response.writeStatus('404 Not Found');
          response.end();
        });
      }
    }
  };
}
