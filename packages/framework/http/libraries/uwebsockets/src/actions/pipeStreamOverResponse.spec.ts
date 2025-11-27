import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

import { Readable } from 'node:stream';

import { Logger } from '@inversifyjs/logger';

import { abortedSymbol } from '../data/abortedSymbol';
import { CustomHttpResponse } from '../models/CustomHttpResponse';
import { pipeStreamOverResponse } from './pipeStreamOverResponse';

describe(pipeStreamOverResponse, () => {
  describe('having a stream', () => {
    let readableStreamMock: Mocked<Readable>;
    let responseMock: Mocked<CustomHttpResponse>;
    let loggerMock: Mocked<Logger>;

    beforeAll(() => {
      readableStreamMock = {
        destroy: vitest.fn() as unknown,
        on: vitest.fn() as unknown,
        pause: vitest.fn() as unknown,
        resume: vitest.fn() as unknown,
      } as Partial<Mocked<Readable>> as Mocked<Readable>;

      responseMock = {
        cork: vitest.fn().mockImplementation((callback: () => void) => {
          callback();
        }),
        end: vitest.fn(),
        getWriteOffset: vitest.fn(),
        onAborted: vitest.fn(),
        onWritable: vitest.fn(),
        write: vitest.fn(),
        writeStatus: vitest.fn(),
      } as Partial<Mocked<CustomHttpResponse>> as Mocked<CustomHttpResponse>;

      loggerMock = {
        error: vitest.fn(),
      } as Partial<Mocked<Logger>> as Mocked<Logger>;
    });

    describe('when called', () => {
      beforeAll(() => {
        pipeStreamOverResponse(responseMock, readableStreamMock, loggerMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call response.onAborted()', () => {
        expect(responseMock.onAborted).toHaveBeenCalledExactlyOnceWith(
          expect.any(Function),
        );
      });

      it('should call readableStream.on()', () => {
        expect(readableStreamMock.on).toHaveBeenCalledTimes(3);
        expect(readableStreamMock.on).toHaveBeenNthCalledWith(
          1,
          'data',
          expect.any(Function),
        );
        expect(readableStreamMock.on).toHaveBeenNthCalledWith(
          2,
          'error',
          expect.any(Function),
        );
        expect(readableStreamMock.on).toHaveBeenNthCalledWith(
          3,
          'end',
          expect.any(Function),
        );
      });
    });

    describe('when called, and response is aborted', () => {
      let onAbortedCallback: () => void;

      beforeAll(() => {
        pipeStreamOverResponse(responseMock, readableStreamMock, loggerMock);

        onAbortedCallback = responseMock.onAborted.mock
          .calls[0]?.[0] as () => void;

        onAbortedCallback();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call readableStream.destroy()', () => {
        expect(readableStreamMock.destroy).toHaveBeenCalledExactlyOnceWith();
      });
    });

    describe('when called, and readableStream emits data, and response.write() returns true', () => {
      let dataCallback: (chunk: Buffer) => void;
      let chunkFixture: Buffer;

      beforeAll(() => {
        pipeStreamOverResponse(responseMock, readableStreamMock, loggerMock);

        const dataCall:
          | [event: string | symbol, listener: (...args: unknown[]) => void]
          | undefined = readableStreamMock.on.mock.calls.find(
          (call: unknown[]) => call[0] === 'data',
        );
        dataCallback = dataCall?.[1] as (chunk: Buffer) => void;

        chunkFixture = Buffer.from('test data');

        responseMock.getWriteOffset.mockReturnValueOnce(0);

        responseMock.write.mockReturnValueOnce(true);

        dataCallback(chunkFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call response.getWriteOffset()', () => {
        expect(responseMock.getWriteOffset).toHaveBeenCalledExactlyOnceWith();
      });

      it('should call response.write()', () => {
        expect(responseMock.write).toHaveBeenCalledExactlyOnceWith(
          expect.any(ArrayBuffer),
        );
      });

      it('should not call readableStream.pause()', () => {
        expect(readableStreamMock.pause).not.toHaveBeenCalled();
      });
    });

    describe('when called, and stream emits data, and response.write() returns false (backpressure)', () => {
      let dataCallback: (chunk: Buffer) => void;
      let chunkFixture: Buffer;

      beforeAll(() => {
        pipeStreamOverResponse(responseMock, readableStreamMock, loggerMock);

        const dataCall:
          | [event: string | symbol, listener: (...args: unknown[]) => void]
          | undefined = readableStreamMock.on.mock.calls.find(
          (call: unknown[]) => call[0] === 'data',
        );
        dataCallback = dataCall?.[1] as (chunk: Buffer) => void;

        chunkFixture = Buffer.from('test data');

        responseMock.getWriteOffset.mockReturnValueOnce(0);
        responseMock.write.mockReturnValueOnce(false);

        dataCallback(chunkFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call readableStream.pause()', () => {
        expect(readableStreamMock.pause).toHaveBeenCalledExactlyOnceWith();
      });

      it('should call response.onWritable()', () => {
        expect(responseMock.onWritable).toHaveBeenCalledExactlyOnceWith(
          expect.any(Function),
        );
      });
    });

    describe('when called, and backpressure occurs, and response.onWritable() is called with retry success', () => {
      let dataCallback: (chunk: Buffer) => void;
      let onWritableCallback: (offset: number) => boolean;
      let chunkFixture: Buffer;

      beforeAll(() => {
        pipeStreamOverResponse(responseMock, readableStreamMock, loggerMock);

        const dataCall:
          | [event: string | symbol, listener: (...args: unknown[]) => void]
          | undefined = readableStreamMock.on.mock.calls.find(
          (call: unknown[]) => call[0] === 'data',
        );
        dataCallback = dataCall?.[1] as (chunk: Buffer) => void;

        chunkFixture = Buffer.from('test data');

        responseMock.getWriteOffset.mockReturnValueOnce(0);
        responseMock.write.mockReturnValueOnce(false);

        dataCallback(chunkFixture);

        onWritableCallback = responseMock.onWritable.mock.calls[0]?.[0] as (
          offset: number,
        ) => boolean;

        responseMock.write.mockReturnValueOnce(true);

        onWritableCallback(0);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call readableStream.resume()', () => {
        expect(readableStreamMock.resume).toHaveBeenCalledExactlyOnceWith();
      });
    });

    describe('when called, and backpressure occurs, and response.onWritable() is called with retry failure', () => {
      let dataCallback: (chunk: Buffer) => void;
      let onWritableCallback: (offset: number) => boolean;
      let chunkFixture: Buffer;

      beforeAll(() => {
        pipeStreamOverResponse(responseMock, readableStreamMock, loggerMock);

        const dataCall:
          | [event: string | symbol, listener: (...args: unknown[]) => void]
          | undefined = readableStreamMock.on.mock.calls.find(
          (call: unknown[]) => call[0] === 'data',
        );
        dataCallback = dataCall?.[1] as (chunk: Buffer) => void;

        chunkFixture = Buffer.from('test data');

        responseMock.getWriteOffset.mockReturnValueOnce(0);
        responseMock.write.mockReturnValueOnce(false);

        dataCallback(chunkFixture);

        onWritableCallback = responseMock.onWritable.mock.calls[0]?.[0] as (
          offset: number,
        ) => boolean;

        responseMock.write.mockReturnValueOnce(false);

        onWritableCallback(0);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not call readableStream.destroy()', () => {
        expect(readableStreamMock.destroy).not.toHaveBeenCalled();
      });

      it('should not call readableStream.resume()', () => {
        expect(readableStreamMock.resume).not.toHaveBeenCalled();
      });
    });

    describe('when called, and stream is aborted before data event', () => {
      let dataCallback: (chunk: Buffer) => void;
      let chunkFixture: Buffer;

      beforeAll(() => {
        (responseMock as CustomHttpResponse)[abortedSymbol] = true;

        pipeStreamOverResponse(responseMock, readableStreamMock, loggerMock);

        const dataCall:
          | [event: string | symbol, listener: (...args: unknown[]) => void]
          | undefined = readableStreamMock.on.mock.calls.find(
          (call: unknown[]) => call[0] === 'data',
        );
        dataCallback = dataCall?.[1] as (chunk: Buffer) => void;

        chunkFixture = Buffer.from('test data');

        dataCallback(chunkFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete (responseMock as CustomHttpResponse)[abortedSymbol];
      });

      it('should call readableStream.destroy()', () => {
        expect(readableStreamMock.destroy).toHaveBeenCalledExactlyOnceWith();
      });

      it('should not call response.write()', () => {
        expect(responseMock.write).not.toHaveBeenCalled();
      });
    });

    describe('when called, and loggerMock.error() is called', () => {
      let errorCallback: (error: Error) => void;
      let errorFixture: Error;

      beforeAll(() => {
        pipeStreamOverResponse(responseMock, readableStreamMock, loggerMock);

        const errorCall:
          | [event: string | symbol, listener: (...args: unknown[]) => void]
          | undefined = readableStreamMock.on.mock.calls.find(
          (call: unknown[]) => call[0] === 'error',
        );
        errorCallback = errorCall?.[1] as (error: Error) => void;

        errorFixture = new Error('Stream read error');

        errorCallback(errorFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call logger.error()', () => {
        expect(loggerMock.error).toHaveBeenCalledExactlyOnceWith(
          errorFixture.stack,
        );
      });

      it('should call readableStream.destroy()', () => {
        expect(readableStreamMock.destroy).toHaveBeenCalledExactlyOnceWith();
      });

      it('should call response.cork()', () => {
        expect(responseMock.cork).toHaveBeenCalledExactlyOnceWith(
          expect.any(Function),
        );
      });
    });

    describe('when called, and stream emits error', () => {
      let errorCallback: (error: Error) => void;
      let errorFixture: Error;

      beforeAll(() => {
        pipeStreamOverResponse(responseMock, readableStreamMock, undefined);

        const errorCall:
          | [event: string | symbol, listener: (...args: unknown[]) => void]
          | undefined = readableStreamMock.on.mock.calls.find(
          (call: unknown[]) => call[0] === 'error',
        );
        errorCallback = errorCall?.[1] as (error: Error) => void;

        errorFixture = new Error('Stream read error');

        errorCallback(errorFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call readableStream.destroy()', () => {
        expect(readableStreamMock.destroy).toHaveBeenCalledExactlyOnceWith();
      });

      it('should call response.cork()', () => {
        expect(responseMock.cork).toHaveBeenCalledExactlyOnceWith(
          expect.any(Function),
        );
      });
    });

    describe('when called, and stream emits error, and response is already aborted', () => {
      let errorCallback: (error: Error) => void;
      let errorFixture: Error;

      beforeAll(() => {
        (responseMock as CustomHttpResponse)[abortedSymbol] = true;

        pipeStreamOverResponse(responseMock, readableStreamMock, loggerMock);

        const errorCall:
          | [event: string | symbol, listener: (...args: unknown[]) => void]
          | undefined = readableStreamMock.on.mock.calls.find(
          (call: unknown[]) => call[0] === 'error',
        );
        errorCallback = errorCall?.[1] as (error: Error) => void;

        errorFixture = new Error('Stream read error');

        errorCallback(errorFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete (responseMock as CustomHttpResponse)[abortedSymbol];
      });

      it('should call readableStream.destroy()', () => {
        expect(readableStreamMock.destroy).toHaveBeenCalledExactlyOnceWith();
      });

      it('should not call response.cork()', () => {
        expect(responseMock.cork).not.toHaveBeenCalled();
      });
    });

    describe('when called, and stream emits end', () => {
      let endCallback: () => void;

      beforeAll(() => {
        pipeStreamOverResponse(responseMock, readableStreamMock, loggerMock);

        const endCall:
          | [event: string | symbol, listener: (...args: unknown[]) => void]
          | undefined = readableStreamMock.on.mock.calls.find(
          (call: unknown[]) => call[0] === 'end',
        );
        endCallback = endCall?.[1] as () => void;

        endCallback();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call readableStream.destroy()', () => {
        expect(readableStreamMock.destroy).toHaveBeenCalledExactlyOnceWith();
      });

      it('should call response.end()', () => {
        expect(responseMock.end).toHaveBeenCalledExactlyOnceWith();
      });
    });
  });
});
