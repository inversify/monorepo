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
 * Also installs a shared `onAborted` handler so later abort registrations
 * (for example from body parsing) compose instead of replacing each other.
 *
 * Safe to call synchronously before returning a captured request proxy.
 */
export function installHttpResponseBodyCapture(response: HttpResponse): void {
  const receivedChunks: ArrayBuffer[] = [];
  const liveHandlers: Set<OnDataHandler> = new Set();
  const abortHandlerList: (() => void)[] = [];
  let finished: boolean = false;
  let aborted: boolean = false;

  const nativeOnAborted: HttpResponse['onAborted'] =
    response.onAborted.bind(response);

  function handleAbort(): void {
    if (aborted) {
      return;
    }

    aborted = true;
    (response as CustomHttpResponse)[abortedSymbol] = true;

    for (const abortHandler of abortHandlerList) {
      abortHandler();
    }

    liveHandlers.clear();
  }

  /*
   * uWebSockets.js keeps a single onAborted callback. Install one shared
   * handler that sets abortedSymbol (preserving write-after-disconnect
   * guards) and fan out to any later abort registrations such as #parseBody.
   */
  nativeOnAborted(handleAbort);

  response.onAborted = (handler: () => void): HttpResponse => {
    abortHandlerList.push(handler);

    if (aborted) {
      handler();
    }

    return response;
  };

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

    if (!finished && !aborted) {
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
