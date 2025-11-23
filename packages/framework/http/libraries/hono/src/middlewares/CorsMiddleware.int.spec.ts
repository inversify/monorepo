import { beforeAll, describe, expect, it } from 'vitest';

import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';
import { Context, Hono } from 'hono';
import { ClientRequest, ClientRequestOptions } from 'hono/client';
import { testClient } from 'hono/testing';
import { BlankEnv } from 'hono/types';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { Container } from 'inversify';

import { InversifyHonoHttpAdapter } from '../adapter/InversifyHonoHttpAdapter';
import { Context as HonoContext } from '../index';
import { CorsMiddleware } from './CorsMiddleware';

interface TestClient {
  messages: ClientRequest<{
    $get: {
      input: object;
      output: {
        query: string | undefined;
        results: string[];
      };
      outputFormat: 'json';
      status: ContentfulStatusCode;
    };
  }>;
}

describe(CorsMiddleware, () => {
  let testClientObject: TestClient;

  beforeAll(async () => {
    @ApplyMiddleware(CorsMiddleware)
    @Controller('/messages')
    class MessageController {
      @Get()
      public async getMessages(
        @HonoContext()
        ctx: Context,
      ): Promise<Response> {
        return ctx.json({ message: 'Hello, World!' });
      }
    }

    const container: Container = new Container();
    container
      .bind(CorsMiddleware)
      .toResolvedValue(
        () =>
          new CorsMiddleware({
            allowHeaders: ['Content-Type', 'Authorization'],
            allowMethods: ['GET', 'POST'],
            credentials: true,
            origin: 'https://example.com',
          }),
      )
      .inSingletonScope();
    container.bind(MessageController).toSelf().inSingletonScope();

    const inversifyHonoHttpAdapter: InversifyHonoHttpAdapter =
      new InversifyHonoHttpAdapter(container, {
        logger: true,
      });

    testClientObject = testClient<
      Hono<
        BlankEnv,
        {
          '/messages': {
            $get: {
              input: object;
              output: {
                query: string | undefined;
                results: string[];
              };
              outputFormat: 'json';
              status: ContentfulStatusCode;
            };
          };
        },
        '/'
      >
    >(await inversifyHonoHttpAdapter.build());
  });

  describe('execute', () => {
    describe('having a valid CORS request', () => {
      let optionsFixture: ClientRequestOptions<unknown>;

      beforeAll(() => {
        optionsFixture = {
          headers: {
            'Content-Type': 'application/json',
            Origin: 'https://example.com',
          },
        };
      });

      describe('when called', () => {
        let response: Response;

        beforeAll(async () => {
          response = await testClientObject.messages.$get(
            undefined,
            optionsFixture,
          );
        });

        it('should return a response with expected headers', async () => {
          expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
            'https://example.com',
          );
          expect(response.headers.get('Access-Control-Allow-Credentials')).toBe(
            'true',
          );
          expect(response.status).toBe(200);
          await expect(response.json()).resolves.toStrictEqual({
            message: 'Hello, World!',
          });
        });
      });
    });

    describe('having a non valid CORS request', () => {
      let optionsFixture: ClientRequestOptions<unknown>;

      beforeAll(() => {
        optionsFixture = {
          headers: {
            'Content-Type': 'application/json',
            Origin: 'https://wrong-example.com',
          },
        };
      });

      describe('when called', () => {
        let response: Response;

        beforeAll(async () => {
          response = await testClientObject.messages.$get(
            undefined,
            optionsFixture,
          );
        });

        it('should return a response with expected headers', async () => {
          expect(
            response.headers.get('Access-Control-Allow-Origin'),
          ).toBeNull();
          expect(response.headers.get('Access-Control-Allow-Credentials')).toBe(
            'true',
          );
          expect(response.status).toBe(200);
          await expect(response.json()).resolves.toStrictEqual({
            message: 'Hello, World!',
          });
        });
      });
    });
  });
});
