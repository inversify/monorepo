import { Readable } from 'node:stream';

import { type Logger } from '@inversifyjs/logger';
import { HttpResponse } from 'uWebSockets.js';

import { toArrayBuffer } from '../calculations/toArrayBuffer';
import { abortedSymbol } from '../data/abortedSymbol';
import { CustomHttpResponse } from '../models/CustomHttpResponse';

/**
 * Pipes a Node.js Readable stream over a uWebSockets.js HTTP response with proper
 * backpressure handling and error management.
 *
 * This function handles:
 * - Backpressure: Pauses the stream when the socket buffer is full
 * - Abort handling: Cleans up resources when the client disconnects
 * - Error handling: Catches stream errors and sends appropriate error responses
 *
 * @param response - The uWebSockets.js HTTP response object
 * @param readableStream - The Node.js Readable stream to pipe (must not be in object mode)
 * @param logger - Optional logger for error logging
 *
 * @example
 * ```typescript
 * const fileStream = fs.createReadStream('./video.mp4');
 * pipeStreamOverResponse(response, fileStream, undefined);
 * ```
 */
export function pipeStreamOverResponse(
  response: HttpResponse,
  readableStream: Readable,
  logger: Logger | undefined,
): void {
  let isStreamClosed: boolean = false;
  let storedBuffer: ArrayBuffer | undefined;
  let storedOffset: number | undefined;

  /**
   * Clean up function called when the stream is aborted or finished
   */
  const cleanup: () => void = (): void => {
    if (!isStreamClosed) {
      isStreamClosed = true;
      readableStream.destroy();
      storedBuffer = undefined;
      storedOffset = undefined;
    }
  };

  // Handle response abortion (client disconnected)
  response.onAborted((): void => {
    cleanup();
  });

  // Handle stream data chunks
  readableStream.on('data', (chunk: unknown): void => {
    if ((response as CustomHttpResponse)[abortedSymbol] === true) {
      cleanup();
      return;
    }

    const arrayBuffer: ArrayBuffer = toArrayBuffer(chunk);

    const lastOffset: number = response.getWriteOffset();

    let ok: boolean = true as boolean;

    response.cork((): void => {
      ok = response.write(arrayBuffer);
    });

    if (!ok) {
      readableStream.pause();

      storedBuffer = arrayBuffer;
      storedOffset = lastOffset;

      response.onWritable((offset: number): boolean => {
        if ((response as CustomHttpResponse)[abortedSymbol] === true) {
          cleanup();

          return false;
        }

        if (storedBuffer === undefined || storedOffset === undefined) {
          return false;
        }

        let retryOk: boolean = true as boolean;

        response.cork((): void => {
          retryOk = response.write(
            (storedBuffer as ArrayBuffer).slice(
              offset - (storedOffset as number),
            ),
          );
        });

        if (retryOk) {
          readableStream.resume();
        }

        return retryOk;
      });
    }
  });

  readableStream.on('error', (error: Error): void => {
    logger?.error(error.stack ?? error.message);

    cleanup();

    if ((response as CustomHttpResponse)[abortedSymbol] !== true) {
      response.cork((): void => {
        response.writeStatus('500');
        response.end('Stream error occurred');
      });
    }
  });

  readableStream.on('end', (): void => {
    cleanup();

    if ((response as CustomHttpResponse)[abortedSymbol] !== true) {
      response.cork((): void => {
        response.end();
      });
    }
  });
}
