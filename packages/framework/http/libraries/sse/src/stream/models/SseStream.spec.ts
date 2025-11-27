import { beforeAll, describe, expect, it } from 'vitest';

import { MessageEvent } from '../../sse/models/MessageEvent';
import { SseStream } from './SseStream';

describe(SseStream, () => {
  describe('.writeMessageEvent', () => {
    describe('when called', () => {
      let sseStream: SseStream;
      let messageEventFixture: MessageEvent;

      let result: unknown;

      beforeAll(async () => {
        sseStream = new SseStream();

        messageEventFixture = {
          data: 'test-data',
          id: '1',
          type: 'test-event',
        };

        const chunks: string[] = [];

        sseStream.on('data', (chunk: Buffer) => {
          chunks.push(chunk.toString());
        });

        sseStream.writeMessageEvent(messageEventFixture);
        sseStream.end();

        await new Promise(
          (resolve: (value: void | PromiseLike<void>) => void) =>
            sseStream.on('end', resolve),
        );

        result = chunks.join('');
      });

      it('should write a message event to the stream', async () => {
        expect(result).toBe('event: test-event\nid: 1\ndata: test-data\n\n');
      });
    });
  });

  describe('.end', () => {
    describe('when called', () => {
      let sseStream: SseStream;

      beforeAll(async () => {
        sseStream = new SseStream();

        sseStream.resume();
        const endPromise: Promise<void> = new Promise(
          (resolve: (value: void | PromiseLike<void>) => void) =>
            sseStream.on('end', resolve),
        );

        sseStream.end();

        await endPromise;
      });

      it('should end the stream', async () => {
        expect(sseStream.readableEnded).toBe(true);
      });
    });
  });
});
