import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import http, { type RequestListener } from 'node:http';
import { type AddressInfo } from 'node:net';

import {
  CatchError,
  type ErrorFilter,
  type Pipe,
} from '@inversifyjs/framework-core';
import {
  BadRequestHttpResponse,
  Body,
  Controller,
  Post,
} from '@inversifyjs/http-core';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { OasRequestBody, SwaggerUiProvider } from '@inversifyjs/http-open-api';
import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { InversifyValidationError } from '@inversifyjs/validation-common';
import type express from 'express';
import { Container, type Newable } from 'inversify';

import { Validate } from '../../common/decorators/Validate.js';
import { OpenApiValidationPipe } from './OpenApiValidationPipe.js';

interface Server {
  host: string;
  port: number;
  shutdown: () => Promise<void>;
}

async function buildExpressServer(
  container: Container,
  errorFilterList: Newable<ErrorFilter>[],
  pipeList: (Newable<Pipe> | Pipe)[],
): Promise<Server> {
  const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
    container,
    {
      logger: true,
      useCookies: true,
    },
  );

  adapter.useGlobalFilters(...errorFilterList);
  adapter.useGlobalPipe(...pipeList);

  const application: express.Application = await adapter.build();

  const httpServer: http.Server = http.createServer(
    application as RequestListener,
  );

  return new Promise<Server>(
    (resolve: (value: Server | PromiseLike<Server>) => void) => {
      httpServer.listen(0, '127.0.0.1', () => {
        const address: AddressInfo | string | null = httpServer.address();

        if (address === null || typeof address === 'string') {
          throw new Error('Failed to get server address');
        }

        const server: Server = {
          host: address.address,
          port: address.port,
          shutdown: async (): Promise<void> => {
            await new Promise<void>(
              (
                resolve: (value: void | PromiseLike<void>) => void,
                reject: (reason?: unknown) => void,
              ) => {
                httpServer.close((error: Error | undefined) => {
                  if (error !== undefined) {
                    reject(error);
                  } else {
                    resolve();
                  }
                });
              },
            );
          },
        };

        resolve(server);
      });
    },
  );
}

@CatchError(InversifyValidationError)
class ValidationErrorFilter implements ErrorFilter<InversifyValidationError> {
  public catch(error: InversifyValidationError): never {
    throw new BadRequestHttpResponse(
      { message: error.message },
      error.message,
      {
        cause: error,
      },
    );
  }
}

describe(OpenApiValidationPipe, () => {
  describe('having an OpenApiValidationPipe (v3.1) in an HTTP server with validated endpoints', () => {
    interface Message {
      content: string;
    }

    @Controller('/messages')
    class MessageController {
      @OasRequestBody({
        content: {
          'application/json': {
            schema: {
              additionalProperties: false,
              properties: { content: { maxLength: 100, type: 'string' } },
              required: ['content'],
              type: 'object',
            },
          },
        },
      })
      @Post()
      public async createMessage(
        @Body() @Validate() message: Message,
      ): Promise<Message> {
        return message;
      }
    }

    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();

      container.bind(ValidationErrorFilter).toSelf().inSingletonScope();
      container.bind(MessageController).toSelf().inSingletonScope();

      const openApiObject: OpenApi3Dot1Object = {
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.1.1',
      };

      const swaggerProvider: SwaggerUiProvider = new SwaggerUiProvider({
        api: {
          openApiObject,
          path: '/docs',
        },
      });

      swaggerProvider.provide(container);

      const pipe: OpenApiValidationPipe = new OpenApiValidationPipe(
        swaggerProvider.openApiObject,
      );

      server = await buildExpressServer(
        container,
        [ValidationErrorFilter],
        [pipe],
      );
    });

    afterAll(async () => {
      await server.shutdown();
    });

    describe('when a valid POST /messages request is made', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/messages`,
          {
            body: JSON.stringify({ content: 'Hello, world!' }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          },
        );
      });

      it('should return expected Response', async () => {
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toStrictEqual(
          expect.stringContaining('application/json'),
        );
        await expect(response.json()).resolves.toStrictEqual({
          content: 'Hello, world!',
        });
      });
    });

    describe('when an invalid POST /messages request is made', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/messages`,
          {
            body: JSON.stringify({
              content: 'Hello, world!',
              extra: 'not allowed',
            }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          },
        );
      });

      it('should return expected Response', async () => {
        expect(response.status).toBe(400);
        expect(response.headers.get('content-type')).toStrictEqual(
          expect.stringContaining('application/json'),
        );
        await expect(response.json()).resolves.toStrictEqual({
          message: expect.stringContaining('additionalProperties'),
        });
      });
    });
  });

  describe('having an OpenApiValidationPipe (v3.1) with content-type fallback', () => {
    interface User {
      name: string;
    }

    @Controller('/users')
    class UserController {
      @OasRequestBody({
        content: {
          'application/json': {
            schema: {
              additionalProperties: false,
              properties: { name: { type: 'string' } },
              required: ['name'],
              type: 'object',
            },
          },
        },
      })
      @Post()
      public async createUser(@Body() @Validate() user: User): Promise<User> {
        return user;
      }
    }

    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();

      container.bind(ValidationErrorFilter).toSelf().inSingletonScope();
      container.bind(UserController).toSelf().inSingletonScope();

      const openApiObject: OpenApi3Dot1Object = {
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.1.1',
      };

      const swaggerProvider: SwaggerUiProvider = new SwaggerUiProvider({
        api: {
          openApiObject,
          path: '/docs',
        },
      });

      swaggerProvider.provide(container);

      const pipe: OpenApiValidationPipe = new OpenApiValidationPipe(
        swaggerProvider.openApiObject,
      );

      server = await buildExpressServer(
        container,
        [ValidationErrorFilter],
        [pipe],
      );
    });

    afterAll(async () => {
      await server.shutdown();
    });

    describe('when a valid POST /users request is made with single content type and no Content-Type header', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/users`,
          {
            body: JSON.stringify({ name: 'Alice' }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          },
        );
      });

      it('should return expected Response', async () => {
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toStrictEqual({
          name: 'Alice',
        });
      });
    });
  });

  describe('having an OpenApiValidationPipe (v3.1) with content-type ambiguity', () => {
    interface Item {
      label: string;
    }

    @Controller('/items')
    class ItemController {
      @OasRequestBody({
        content: {
          'application/json': {
            schema: {
              properties: { label: { type: 'string' } },
              required: ['label'],
              type: 'object',
            },
          },
          'application/xml': {
            schema: {
              properties: { label: { type: 'string' } },
              required: ['label'],
              type: 'object',
            },
          },
        },
      })
      @Post()
      public async createItem(@Body() @Validate() item: Item): Promise<Item> {
        return item;
      }
    }

    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();

      container.bind(ValidationErrorFilter).toSelf().inSingletonScope();
      container.bind(ItemController).toSelf().inSingletonScope();

      const openApiObject: OpenApi3Dot1Object = {
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.1.1',
      };

      const swaggerProvider: SwaggerUiProvider = new SwaggerUiProvider({
        api: {
          openApiObject,
          path: '/docs',
        },
      });

      swaggerProvider.provide(container);

      const pipe: OpenApiValidationPipe = new OpenApiValidationPipe(
        swaggerProvider.openApiObject,
      );

      server = await buildExpressServer(
        container,
        [ValidationErrorFilter],
        [pipe],
      );
    });

    afterAll(async () => {
      await server.shutdown();
    });

    describe('when a POST /items request is made with Content-Type header but no content-type provider', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/items`,
          {
            body: JSON.stringify({ label: 'My Item' }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          },
        );
      });

      it('should return 400 due to ambiguous content type', async () => {
        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toStrictEqual({
          message: expect.stringContaining('Cannot determine content type'),
        });
      });
    });
  });
});
