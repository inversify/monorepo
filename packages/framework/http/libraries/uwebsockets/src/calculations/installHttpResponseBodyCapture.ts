import { type HttpResponse } from 'uWebSockets.js';

import { abortedSymbol } from '../data/abortedSymbol.js';
import { type CustomHttpResponse } from '../models/CustomHttpResponse.js';

type OnDataHandler = (chunk: ArrayBuffer, isLast: boolean) => void;

/**
 * Takes ownership of `response.onData`, buffers arriving body chunks, and
 * replaces `onData` with a fan-out that:
 * - replays chunks already received to late subscribers
 * - broadcasts new chunks to live subscribers as they arrive
 *
 * Safe to call synchronously before returning a captured request proxy.
 */
export function installHttpResponseBodyCapture(response: HttpResponse): void {
  const receivedChunks: ArrayBuffer[] = [];
  const liveHandlers: Set<OnDataHandler> = new Set();
  let finished: boolean = false;

  response.onAborted((): void => {
    (response as CustomHttpResponse)[abortedSymbol] = true;
  });

  /*
   * Register the native onData handler before replacing the property. From
   * this point on we own body delivery for this response.
   */
  response.onData((chunk: ArrayBuffer, isLast: boolean): void => {
    /*
     * uWebSockets.js may reuse the underlying ArrayBuffer between onData()
     * calls, so every chunk must be copied before the next one arrives.
     */
    const chunkCopy: ArrayBuffer = chunk.slice(0);

    receivedChunks.push(chunkCopy);

    if (isLast) {
      finished = true;
    }

    for (const handler of [...liveHandlers]) {
      handler(chunkCopy, isLast);

      if (isLast) {
        liveHandlers.delete(handler);
      }
    }
  });

  const onDataCapture: HttpResponse['onData'] = (
    handler: OnDataHandler,
  ): HttpResponse => {
    for (let index: number = 0; index < receivedChunks.length; index++) {
      const isLast: boolean = finished && index === receivedChunks.length - 1;

      handler(receivedChunks[index] as ArrayBuffer, isLast);
    }

    if (finished && receivedChunks.length === 0) {
      handler(new ArrayBuffer(0), true);
    }

    if (!finished) {
      liveHandlers.add(handler);
    }

    return response;
  };

  Object.defineProperty(response, 'onData', {
    configurable: true,
    value: onDataCapture,
    writable: true,
  });
}
