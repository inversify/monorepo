import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Controller, Get, HttpStatusCode } from '@inversifyjs/http-core';
import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer';
import { Server } from '../../server/models/Server';
import { SseStream } from '../../stream/models/SseStream';
import { MessageEvent } from '../models/MessageEvent';
import { SsePublisherOptions } from '../models/SsePublisherOptions';
import { SsePublisher } from './SsePublisher';

describe(SsePublisher, () => {
  describe.each<[(container: Container) => Promise<Server>]>([
    [buildExpress4Server],
    [buildExpressServer],
    [buildFastifyServer],
    [buildHonoServer],
    // [buildUwebSocketsJsServer], Depends on https://github.com/uNetworking/uWebSockets/pull/1897
  ])(
    'Having a server with an SSE endpoint that initially sends no events via AsyncIterable',
    (buildServer: (container: Container) => Promise<Server>) => {
      let resolveYieldPromise: () => void;
      let yieldPromise: Promise<void>;

      let server: Server;

      @Controller('/messages')
      class MessagesController {
        @Get()
        public getMessages(
          @SsePublisher()
          ssePublisher: (sseOptions: SsePublisherOptions) => unknown,
        ): unknown {
          return ssePublisher({
            events: this.#yieldData.bind(this)(),
          });
        }

        async *#yieldData(): AsyncGenerator<MessageEvent> {
          await yieldPromise;

          yield { data: 'message 1' };
          yield { data: 'message 2' };
          yield { data: 'message 3' };
        }
      }

      beforeAll(async () => {
        yieldPromise = new Promise<void>((resolve: () => void) => {
          resolveYieldPromise = resolve;
        });

        const container: Container = new Container();

        container.bind(MessagesController).toSelf().inSingletonScope();

        server = await buildServer(container);
      });

      afterAll(async () => {
        await server.shutdown();
      });

      describe('when connecting to the SSE endpoint', () => {
        let response: Response;

        beforeAll(async () => {
          const fetchRequest: Request = new Request(
            `http://${server.host}:${server.port.toString()}/messages`,
            {
              method: 'GET',
              mode: 'no-cors',
              redirect: 'follow',
            },
          );

          response = await fetch(fetchRequest);
        });

        it('should return "text/event-stream" Content-Type header', () => {
          expect(response.headers.get('content-type')).toStrictEqual(
            expect.stringContaining('text/event-stream'),
          );
        });

        it('should return Cache-Control header with "no-cache"', () => {
          expect(response.headers.get('cache-control')).toStrictEqual(
            expect.stringContaining('no-cache'),
          );
        });

        it('should return "keep-alive" Connection header', () => {
          expect(response.headers.get('connection')).toBe('keep-alive');
        });

        it('should return "chunked" Transfer-Encoding header', () => {
          expect(response.headers.get('transfer-encoding')).toBe('chunked');
        });

        it('should return a 200 response', () => {
          expect(response.status).toBe(200);
        });

        describe('when server yields data', () => {
          let responseText: string;

          beforeAll(async () => {
            resolveYieldPromise();

            responseText = await response.text();
          });

          it('should return the expected SSE formatted messages', () => {
            const expectedMessages: string =
              'data: message 1\n\ndata: message 2\n\ndata: message 3\n\n';

            expect(responseText).toBe(expectedMessages);
          });
        });
      });
    },
  );

  describe.each<[(container: Container) => Promise<Server>]>([
    [buildExpress4Server],
    [buildExpressServer],
    [buildFastifyServer],
    [buildHonoServer],
    [buildUwebSocketsJsServer],
  ])(
    'Having a server with an SSE endpoint that initially sends events via AsyncIterable',
    (buildServer: (container: Container) => Promise<Server>) => {
      let resolveYieldPromise: () => void;
      let yieldPromise: Promise<void>;

      let server: Server;

      @Controller('/messages')
      class MessagesController {
        @Get()
        public getMessages(
          @SsePublisher()
          ssePublisher: (sseOptions: SsePublisherOptions) => unknown,
        ): unknown {
          return ssePublisher({
            events: this.#yieldData.bind(this)(),
          });
        }

        async *#yieldData(): AsyncGenerator<MessageEvent> {
          yield { data: 'message 1' };

          await yieldPromise;

          yield { data: 'message 2' };
          yield { data: 'message 3' };
        }
      }

      beforeAll(async () => {
        yieldPromise = new Promise<void>((resolve: () => void) => {
          resolveYieldPromise = resolve;
        });

        const container: Container = new Container();

        container.bind(MessagesController).toSelf().inSingletonScope();

        server = await buildServer(container);
      });

      afterAll(async () => {
        await server.shutdown();
      });

      describe('when connecting to the SSE endpoint', () => {
        let response: Response;

        beforeAll(async () => {
          const fetchRequest: Request = new Request(
            `http://${server.host}:${server.port.toString()}/messages`,
            {
              method: 'GET',
              mode: 'no-cors',
              redirect: 'follow',
            },
          );

          response = await fetch(fetchRequest);
        });

        it('should return "text/event-stream" Content-Type header', () => {
          expect(response.headers.get('content-type')).toStrictEqual(
            expect.stringContaining('text/event-stream'),
          );
        });

        it('should return Cache-Control header with "no-cache"', () => {
          expect(response.headers.get('cache-control')).toStrictEqual(
            expect.stringContaining('no-cache'),
          );
        });

        it('should return "keep-alive" Connection header', () => {
          expect(response.headers.get('connection')).toBe('keep-alive');
        });

        it('should return "chunked" Transfer-Encoding header', () => {
          expect(response.headers.get('transfer-encoding')).toBe('chunked');
        });

        it('should return a 200 response', () => {
          expect(response.status).toBe(200);
        });

        describe('when server yields data', () => {
          let responseText: string;

          beforeAll(async () => {
            resolveYieldPromise();

            responseText = await response.text();
          });

          it('should return the expected SSE formatted messages', () => {
            const expectedMessages: string =
              'data: message 1\n\ndata: message 2\n\ndata: message 3\n\n';

            expect(responseText).toBe(expectedMessages);
          });
        });
      });
    },
  );

  describe.each<[(container: Container) => Promise<Server>]>([
    [buildExpress4Server],
    [buildExpressServer],
    [buildFastifyServer],
    [buildHonoServer],
    [buildUwebSocketsJsServer],
  ])(
    'Having a server with an SSE endpoint that initially sends events via SseStream',
    (buildServer: (container: Container) => Promise<Server>) => {
      let resolveYieldPromise: () => void;
      let yieldPromise: Promise<void>;

      let server: Server;

      @Controller('/messages')
      class MessagesController {
        @Get()
        public getMessages(
          @SsePublisher()
          ssePublisher: (sseOptions: SsePublisherOptions) => unknown,
        ): unknown {
          const sseStream: SseStream = new SseStream();

          void this.#yieldData(sseStream);

          return ssePublisher({
            events: sseStream,
          });
        }

        async #yieldData(stream: SseStream): Promise<void> {
          await stream.writeMessageEvent({ data: 'message 1' });

          await yieldPromise;

          await stream.writeMessageEvent({ data: 'message 2' });
          await stream.writeMessageEvent({ data: 'message 3' });

          stream.end();
        }
      }

      beforeAll(async () => {
        yieldPromise = new Promise<void>((resolve: () => void) => {
          resolveYieldPromise = resolve;
        });

        const container: Container = new Container();

        container.bind(MessagesController).toSelf().inSingletonScope();

        server = await buildServer(container);
      });

      afterAll(async () => {
        await server.shutdown();
      });

      describe('when connecting to the SSE endpoint', () => {
        let response: Response;

        beforeAll(async () => {
          const fetchRequest: Request = new Request(
            `http://${server.host}:${server.port.toString()}/messages`,
            {
              method: 'GET',
              mode: 'no-cors',
              redirect: 'follow',
            },
          );

          response = await fetch(fetchRequest);
        });

        it('should return "text/event-stream" Content-Type header', () => {
          expect(response.headers.get('content-type')).toStrictEqual(
            expect.stringContaining('text/event-stream'),
          );
        });

        it('should return Cache-Control header with "no-cache"', () => {
          expect(response.headers.get('cache-control')).toStrictEqual(
            expect.stringContaining('no-cache'),
          );
        });

        it('should return "keep-alive" Connection header', () => {
          expect(response.headers.get('connection')).toBe('keep-alive');
        });

        it('should return "chunked" Transfer-Encoding header', () => {
          expect(response.headers.get('transfer-encoding')).toBe('chunked');
        });

        it('should return a 200 response', () => {
          expect(response.status).toBe(200);
        });

        describe('when server yields data', () => {
          let responseText: string;

          beforeAll(async () => {
            resolveYieldPromise();

            responseText = await response.text();
          });

          it('should return the expected SSE formatted messages', () => {
            const expectedMessages: string =
              'data: message 1\n\ndata: message 2\n\ndata: message 3\n\n';

            expect(responseText).toBe(expectedMessages);
          });
        });
      });
    },
  );

  describe.each<[(container: Container) => Promise<Server>]>([
    [buildExpress4Server],
    [buildExpressServer],
    [buildFastifyServer],
    [buildHonoServer],
    [buildUwebSocketsJsServer],
  ])(
    'Having a server with an SSE endpoint that initially sends events via SseStream with custom status code',
    (buildServer: (container: Container) => Promise<Server>) => {
      const statusCodeFixture: HttpStatusCode = HttpStatusCode.CREATED;
      let resolveYieldPromise: () => void;
      let yieldPromise: Promise<void>;

      let server: Server;

      @Controller('/messages')
      class MessagesController {
        @Get()
        public getMessages(
          @SsePublisher()
          ssePublisher: (sseOptions: SsePublisherOptions) => unknown,
        ): unknown {
          const sseStream: SseStream = new SseStream();

          void this.#yieldData(sseStream);

          return ssePublisher({
            events: sseStream,
            statusCode: statusCodeFixture,
          });
        }

        async #yieldData(stream: SseStream): Promise<void> {
          await stream.writeMessageEvent({ data: 'message 1' });

          await yieldPromise;

          await stream.writeMessageEvent({ data: 'message 2' });
          await stream.writeMessageEvent({ data: 'message 3' });

          stream.end();
        }
      }

      beforeAll(async () => {
        yieldPromise = new Promise<void>((resolve: () => void) => {
          resolveYieldPromise = resolve;
        });

        const container: Container = new Container();

        container.bind(MessagesController).toSelf().inSingletonScope();

        server = await buildServer(container);
      });

      afterAll(async () => {
        await server.shutdown();
      });

      describe('when connecting to the SSE endpoint', () => {
        let response: Response;

        beforeAll(async () => {
          const fetchRequest: Request = new Request(
            `http://${server.host}:${server.port.toString()}/messages`,
            {
              method: 'GET',
              mode: 'no-cors',
              redirect: 'follow',
            },
          );

          response = await fetch(fetchRequest);
        });

        it('should return "text/event-stream" Content-Type header', () => {
          expect(response.headers.get('content-type')).toStrictEqual(
            expect.stringContaining('text/event-stream'),
          );
        });

        it('should return Cache-Control header with "no-cache"', () => {
          expect(response.headers.get('cache-control')).toStrictEqual(
            expect.stringContaining('no-cache'),
          );
        });

        it('should return "keep-alive" Connection header', () => {
          expect(response.headers.get('connection')).toBe('keep-alive');
        });

        it('should return "chunked" Transfer-Encoding header', () => {
          expect(response.headers.get('transfer-encoding')).toBe('chunked');
        });

        it(`should return a ${statusCodeFixture.toString()} response`, () => {
          expect(response.status).toBe(statusCodeFixture);
        });

        describe('when server yields data', () => {
          let responseText: string;

          beforeAll(async () => {
            resolveYieldPromise();

            responseText = await response.text();
          });

          it('should return the expected SSE formatted messages', () => {
            const expectedMessages: string =
              'data: message 1\n\ndata: message 2\n\ndata: message 3\n\n';

            expect(responseText).toBe(expectedMessages);
          });
        });
      });
    },
  );
});
