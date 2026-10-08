import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Body, Controller, Get, Post, Query } from '@inversifyjs/http-core';
import { Container } from 'inversify';
import {
  type TemplatedApp,
  type us_listen_socket,
  us_socket_local_port,
} from 'uWebSockets.js';

import { InversifyUwebSocketsHttpAdapter } from './InversifyUwebSocketsHttpAdapter.js';

interface Server {
  host: string;
  port: number;
  shutdown: () => void;
}

async function buildUwebSocketsServer(container: Container): Promise<Server> {
  const adapter: InversifyUwebSocketsHttpAdapter =
    new InversifyUwebSocketsHttpAdapter(container, { logger: true });

  const application: TemplatedApp = await adapter.build();

  return new Promise<Server>(
    (
      resolve: (value: Server | PromiseLike<Server>) => void,
      reject: (reason?: unknown) => void,
    ) => {
      application.listen(
        '127.0.0.1',
        0,
        (listenSocket: us_listen_socket | false) => {
          if (listenSocket === false) {
            reject(new Error('Failed to listen'));

            return;
          }

          resolve({
            host: '127.0.0.1',
            port: us_socket_local_port(listenSocket),
            shutdown: (): void => {
              application.close();
            },
          });
        },
      );
    },
  );
}

describe(InversifyUwebSocketsHttpAdapter, () => {
  describe('having a uWebSockets http server with endpoints returning the request query and body', () => {
    let server: Server;

    beforeAll(async () => {
      @Controller('/test')
      class TestController {
        @Get()
        public async get(
          @Query() query: Record<string, unknown>,
        ): Promise<Record<string, unknown>> {
          return query;
        }

        @Post()
        public async post(
          @Body() body: Record<string, unknown>,
        ): Promise<Record<string, unknown>> {
          return body;
        }
      }

      const container: Container = new Container();

      container.bind(TestController).toSelf().inSingletonScope();

      server = await buildUwebSocketsServer(container);
    });

    afterAll(() => {
      server.shutdown();
    });

    describe('when sending a GET request with query keys from Object.prototype', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/test?name=Ann&toString=x&constructor=y`,
          {
            method: 'GET',
          },
        );
      });

      it('should return the query values', async () => {
        await expect(response.json()).resolves.toStrictEqual({
          constructor: 'y',
          name: 'Ann',
          toString: 'x',
        });
      });
    });

    describe('when sending a POST request with an urlencoded body with keys from Object.prototype', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/test`,
          {
            body: 'name=Ann&toString=x&constructor=y',
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
          },
        );
      });

      it('should return the body values', async () => {
        await expect(response.json()).resolves.toStrictEqual({
          constructor: 'y',
          name: 'Ann',
          toString: 'x',
        });
      });
    });
  });
});
