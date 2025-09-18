import { beforeAll, describe, expect, it } from 'vitest';

import stream from 'node:stream';

import { createLogger, transports } from 'winston';

import { LogLevel } from '../../../../model/LogLevel';
import { WinstonLoggerAdapter } from './WinstonLoggerAdapter';

class TestStream extends stream.Writable {
  public chunks: unknown[];

  constructor() {
    super({ objectMode: true });

    this.chunks = [];
  }

  public override _write(
    chunk: unknown,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ) {
    this.chunks.push(chunk);

    callback();
  }
}

describe(WinstonLoggerAdapter, () => {
  describe('.log', () => {
    describe('having a WinstonLoggerAdapter instance with timestamp flag', () => {
      let stream: TestStream;
      let winstonLoggerAdapter: WinstonLoggerAdapter;

      beforeAll(() => {
        stream = new TestStream();

        winstonLoggerAdapter = new WinstonLoggerAdapter(
          createLogger({
            transports: [new transports.Stream({ stream })],
          }),
          'test',
          {
            timestamp: true,
          },
        );
      });

      describe('when called', () => {
        beforeAll(() => {
          winstonLoggerAdapter.log(LogLevel.INFO, 'test-message', {
            context: 'context-test',
          });
        });

        it('should write log to stream', () => {
          const expectedChunks: unknown[] = [
            expect.objectContaining({
              context: 'context-test',
              level: `\x1b[32m${LogLevel.INFO}\x1b[39m`,
              message: '\x1b[32mtest-message\x1b[39m',
            }),
          ];

          expect(stream.chunks).toStrictEqual(expectedChunks);
        });
      });
    });

    describe('having a WinstonLoggerAdapter instance with both json and timestamp flags', () => {
      let stream: TestStream;
      let winstonLoggerAdapter: WinstonLoggerAdapter;

      beforeAll(() => {
        stream = new TestStream();

        winstonLoggerAdapter = new WinstonLoggerAdapter(
          createLogger({
            transports: [new transports.Stream({ stream })],
          }),
          'test',
          {
            json: true,
            timestamp: true,
          },
        );
      });

      describe('when called', () => {
        beforeAll(() => {
          winstonLoggerAdapter.log(LogLevel.INFO, 'test-message', {
            context: 'context-test',
          });
        });

        it('should write log to stream', () => {
          const expectedChunks: unknown[] = [
            expect.objectContaining({
              context: 'context-test',
              level: LogLevel.INFO,
              message: 'test-message',
            }),
          ];

          expect(stream.chunks).toStrictEqual(expectedChunks);
        });
      });
    });
  });
});
