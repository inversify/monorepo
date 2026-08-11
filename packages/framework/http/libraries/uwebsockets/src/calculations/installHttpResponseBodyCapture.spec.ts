import { beforeAll, describe, expect, it, type Mock, vitest } from 'vitest';

import { type HttpResponse } from 'uWebSockets.js';

import { abortedSymbol } from '../data/abortedSymbol.js';
import { type CustomHttpResponse } from '../models/CustomHttpResponse.js';
import { installHttpResponseBodyCapture } from './installHttpResponseBodyCapture.js';

describe(installHttpResponseBodyCapture, () => {
  describe('when a subscriber registers before chunks arrive', () => {
    let firstChunkFixture: ArrayBuffer;
    let secondChunkFixture: ArrayBuffer;
    let nativeOnDataMock: ReturnType<typeof vitest.fn>;
    let pushChunk: (chunk: ArrayBuffer, isLast: boolean) => void;
    let responseMock: HttpResponse;
    let receivedChunks: [ArrayBuffer, boolean][];

    beforeAll(() => {
      firstChunkFixture = new TextEncoder().encode('hello').buffer;
      secondChunkFixture = new TextEncoder().encode(' world').buffer;
      receivedChunks = [];

      nativeOnDataMock = vitest.fn(
        (handler: (chunk: ArrayBuffer, isLast: boolean) => void): void => {
          pushChunk = handler;
        },
      );

      responseMock = {
        onAborted: vitest.fn(),
        onData: nativeOnDataMock,
      } as unknown as HttpResponse;

      installHttpResponseBodyCapture(responseMock);

      responseMock.onData((chunk: ArrayBuffer, isLast: boolean): void => {
        receivedChunks.push([chunk, isLast]);
      });

      pushChunk(firstChunkFixture, false);
      pushChunk(secondChunkFixture, true);
    });

    it('should register the native onData handler', () => {
      expect(nativeOnDataMock).toHaveBeenCalledExactlyOnceWith(
        expect.any(Function),
      );
    });

    it('should broadcast chunks as they arrive', () => {
      expect(receivedChunks).toHaveLength(2);
      expect(
        Buffer.from(receivedChunks[0]?.[0] as ArrayBuffer).toString(),
      ).toBe('hello');
      expect(receivedChunks[0]?.[1]).toBe(false);
      expect(
        Buffer.from(receivedChunks[1]?.[0] as ArrayBuffer).toString(),
      ).toBe(' world');
      expect(receivedChunks[1]?.[1]).toBe(true);
    });

    it('should copy chunks before broadcasting', () => {
      expect(receivedChunks[0]?.[0]).not.toBe(firstChunkFixture);
      expect(receivedChunks[1]?.[0]).not.toBe(secondChunkFixture);
    });
  });

  describe('when a subscriber registers after some chunks arrived', () => {
    let firstChunkFixture: ArrayBuffer;
    let secondChunkFixture: ArrayBuffer;
    let thirdChunkFixture: ArrayBuffer;
    let pushChunk: (chunk: ArrayBuffer, isLast: boolean) => void;
    let responseMock: HttpResponse;
    let receivedChunks: [ArrayBuffer, boolean][];

    beforeAll(() => {
      firstChunkFixture = new TextEncoder().encode('one').buffer;
      secondChunkFixture = new TextEncoder().encode('two').buffer;
      thirdChunkFixture = new TextEncoder().encode('three').buffer;
      receivedChunks = [];

      responseMock = {
        onAborted: vitest.fn(),
        onData: vitest.fn(
          (handler: (chunk: ArrayBuffer, isLast: boolean) => void): void => {
            pushChunk = handler;
          },
        ),
      } as unknown as HttpResponse;

      installHttpResponseBodyCapture(responseMock);

      pushChunk(firstChunkFixture, false);
      pushChunk(secondChunkFixture, false);

      responseMock.onData((chunk: ArrayBuffer, isLast: boolean): void => {
        receivedChunks.push([chunk, isLast]);
      });

      pushChunk(thirdChunkFixture, true);
    });

    it('should replay buffered chunks then broadcast the rest', () => {
      expect(receivedChunks).toHaveLength(3);
      expect(
        Buffer.from(receivedChunks[0]?.[0] as ArrayBuffer).toString(),
      ).toBe('one');
      expect(receivedChunks[0]?.[1]).toBe(false);
      expect(
        Buffer.from(receivedChunks[1]?.[0] as ArrayBuffer).toString(),
      ).toBe('two');
      expect(receivedChunks[1]?.[1]).toBe(false);
      expect(
        Buffer.from(receivedChunks[2]?.[0] as ArrayBuffer).toString(),
      ).toBe('three');
      expect(receivedChunks[2]?.[1]).toBe(true);
    });
  });

  describe('when a subscriber registers after the body is finished', () => {
    let chunkFixture: ArrayBuffer;
    let pushChunk: (chunk: ArrayBuffer, isLast: boolean) => void;
    let responseMock: HttpResponse;
    let receivedChunks: [ArrayBuffer, boolean][];

    beforeAll(() => {
      chunkFixture = new TextEncoder().encode('{"name":"warrior"}').buffer;
      receivedChunks = [];

      responseMock = {
        onAborted: vitest.fn(),
        onData: vitest.fn(
          (handler: (chunk: ArrayBuffer, isLast: boolean) => void): void => {
            pushChunk = handler;
          },
        ),
      } as unknown as HttpResponse;

      installHttpResponseBodyCapture(responseMock);

      pushChunk(chunkFixture, true);

      responseMock.onData((chunk: ArrayBuffer, isLast: boolean): void => {
        receivedChunks.push([chunk, isLast]);
      });
    });

    it('should replay the full buffered body', () => {
      expect(receivedChunks).toHaveLength(1);
      expect(
        Buffer.from(receivedChunks[0]?.[0] as ArrayBuffer).toString(),
      ).toBe('{"name":"warrior"}');
      expect(receivedChunks[0]?.[1]).toBe(true);
    });
  });

  describe('when the request is aborted', () => {
    let responseMock: HttpResponse;
    let subscriberChunks: [ArrayBuffer, boolean][];

    beforeAll(() => {
      subscriberChunks = [];

      const abortHandlerHolder: { current: (() => void) | undefined } = {
        current: undefined,
      };

      responseMock = {
        onAborted: vitest.fn((handler: () => void): HttpResponse => {
          abortHandlerHolder.current = handler;

          return responseMock;
        }),
        onData: vitest.fn(),
      } as unknown as HttpResponse;

      installHttpResponseBodyCapture(responseMock);

      responseMock.onData((chunk: ArrayBuffer, isLast: boolean): void => {
        subscriberChunks.push([chunk, isLast]);
      });

      abortHandlerHolder.current?.();
    });

    it('should mark the response as aborted', () => {
      expect((responseMock as CustomHttpResponse)[abortedSymbol]).toBe(true);
    });

    it('should release live body subscribers without delivering a final chunk', () => {
      expect(subscriberChunks).toStrictEqual([]);
    });
  });

  describe('when onAborted is registered after body capture is installed', () => {
    let laterAbortHandlerMock: Mock<() => void>;
    let responseMock: HttpResponse;

    beforeAll(() => {
      laterAbortHandlerMock = vitest.fn();

      const abortHandlerHolder: { current: (() => void) | undefined } = {
        current: undefined,
      };

      responseMock = {
        onAborted: vitest.fn((handler: () => void): HttpResponse => {
          abortHandlerHolder.current = handler;

          return responseMock;
        }),
        onData: vitest.fn(),
      } as unknown as HttpResponse;

      installHttpResponseBodyCapture(responseMock);

      responseMock.onAborted(laterAbortHandlerMock);

      abortHandlerHolder.current?.();
    });

    it('should mark the response as aborted', () => {
      expect((responseMock as CustomHttpResponse)[abortedSymbol]).toBe(true);
    });

    it('should invoke the later abort handler through the shared handler', () => {
      expect(laterAbortHandlerMock).toHaveBeenCalledExactlyOnceWith();
    });
  });
});
