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

        await sseStream.writeMessageEvent(messageEventFixture);
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

    describe('when called multiple times sequentially', () => {
      let sseStream: SseStream;
      let result: string;

      beforeAll(async () => {
        sseStream = new SseStream();

        const chunks: string[] = [];
        sseStream.on('data', (chunk: Buffer) => {
          chunks.push(chunk.toString());
        });

        // Write multiple messages sequentially, awaiting each
        await sseStream.writeMessageEvent({ data: 'message 1' });
        await sseStream.writeMessageEvent({ data: 'message 2' });
        await sseStream.writeMessageEvent({ data: 'message 3' });

        sseStream.end();

        await new Promise(
          (resolve: (value: void | PromiseLike<void>) => void) =>
            sseStream.on('end', resolve),
        );

        result = chunks.join('');
      });

      it('should write all messages in order', () => {
        expect(result).toBe(
          'data: message 1\n\ndata: message 2\n\ndata: message 3\n\n',
        );
      });
    });

    describe('when called with a small buffer that triggers backpressure', () => {
      let sseStream: SseStream;
      let result: string;

      beforeAll(async () => {
        // Create stream with very small buffer (1 byte) to force backpressure
        sseStream = new SseStream({ highWaterMark: 1 });

        const chunks: string[] = [];
        sseStream.on('data', (chunk: Buffer) => {
          chunks.push(chunk.toString());
        });

        // Start reading to allow backpressure to resolve
        sseStream.resume();

        // Write multiple messages - some will hit backpressure
        await sseStream.writeMessageEvent({ data: 'message 1' });
        await sseStream.writeMessageEvent({ data: 'message 2' });
        await sseStream.writeMessageEvent({ data: 'message 3' });

        sseStream.end();

        await new Promise(
          (resolve: (value: void | PromiseLike<void>) => void) =>
            sseStream.on('end', resolve),
        );

        result = chunks.join('');
      });

      it('should write all messages without data loss despite backpressure', () => {
        expect(result).toBe(
          'data: message 1\n\ndata: message 2\n\ndata: message 3\n\n',
        );
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
