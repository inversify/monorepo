import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import http, { type RequestListener } from 'node:http';
import { type AddressInfo } from 'node:net';

import { serve, type ServerType } from '@hono/node-server';
import {
  CatchError,
  type ErrorFilter,
  type Pipe,
} from '@inversifyjs/framework-core';
import {
  BadRequestHttpResponse,
  Controller,
  Get,
  Post,
} from '@inversifyjs/http-core';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { InversifyExpressHttpAdapter as InversifyExpress4HttpAdapter } from '@inversifyjs/http-express-v4';
import { InversifyFastifyHttpAdapter } from '@inversifyjs/http-fastify';
import { InversifyHonoHttpAdapter } from '@inversifyjs/http-hono';
import {
  OasParameter,
  OasRequestBody,
  SwaggerUiProvider,
} from '@inversifyjs/http-open-api/v3Dot1';
import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { InversifyValidationError } from '@inversifyjs/validation-common';
import express from 'express';
import express4 from 'express4';
import { type FastifyInstance } from 'fastify';
import { type Hono } from 'hono';
import { Container, type Newable } from 'inversify';

import { ValidatedBody } from '../../../metadata/decorators/ValidatedBody.js';
import { ValidatedHeaders } from '../../../metadata/decorators/ValidatedHeaders.js';
import { ValidatedParams } from '../../../metadata/decorators/ValidatedParams.js';
import { ValidatedQuery } from '../../../metadata/decorators/ValidatedQuery.js';
import { OpenApiValidationPipe } from './OpenApiValidationPipe.js';

interface Server {
  host: string;
  port: number;
  shutdown: () => Promise<void>;
}

function jsonOptionalBody() {
  const limit: number = 1e6; // 1MB

  return function (
    req: express.Request | express4.Request,
    res: express.Response | express4.Response,
    next: express.NextFunction | express4.NextFunction,
  ): void {
    const contentType: string = req.headers['content-type'] ?? '';

    // Only handle JSON
    if (!contentType.includes('application/json')) {
      req.body = undefined;
      return next();
    }

    let totalLength: number = 0;
    const chunks: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      totalLength += chunk.length;

      if (totalLength > limit) {
        res.statusCode = 413;
        res.end('Payload too large');
        req.destroy();
        return;
      }

      chunks.push(chunk);
    });

    req.on('end', () => {
      if (totalLength === 0) {
        req.body = undefined;
        return next();
      }

      const raw: string = Buffer.concat(chunks).toString('utf8');

      try {
        req.body = JSON.parse(raw);
        next();
      } catch (_err: unknown) {
        res.statusCode = 400;
        res.end('Invalid JSON');
      }
    });

    req.on('error', (err: Error) => {
      next(err);
    });
  };
}

async function buildExpressServer(
  container: Container,
  errorFilterList: Newable<ErrorFilter>[],
  pipeList: (Newable<Pipe> | Pipe)[],
): Promise<Server> {
  const expressApp: express.Application = express();

  expressApp.use(jsonOptionalBody());

  const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
    container,
    {
      logger: true,
      useJson: false,
    },
    expressApp,
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

async function buildExpress4Server(
  container: Container,
  errorFilterList: Newable<ErrorFilter>[],
  pipeList: (Newable<Pipe> | Pipe)[],
): Promise<Server> {
  const expressApp: express4.Application = express4();

  expressApp.use(jsonOptionalBody());

  const adapter: InversifyExpress4HttpAdapter =
    new InversifyExpress4HttpAdapter(
      container,
      {
        logger: true,
        useCookies: true,
      },
      expressApp,
    );

  adapter.useGlobalFilters(...errorFilterList);
  adapter.useGlobalPipe(...pipeList);

  const application: express4.Application = await adapter.build();

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

async function buildFastifyServer(
  container: Container,
  errorFilterList: Newable<ErrorFilter>[],
  pipeList: (Newable<Pipe> | Pipe)[],
): Promise<Server> {
  const adapter: InversifyFastifyHttpAdapter = new InversifyFastifyHttpAdapter(
    container,
    {
      logger: true,
      useCookies: true,
      useFormUrlEncoded: true,
      useMultipartFormData: true,
    },
  );

  adapter.useGlobalFilters(...errorFilterList);
  adapter.useGlobalPipe(...pipeList);

  const application: FastifyInstance = await adapter.build();

  await application.listen({ host: '0.0.0.0', port: 0 });

  const address: AddressInfo | string | null = application.server.address();

  if (address === null || typeof address === 'string') {
    throw new Error('Failed to get server address');
  }

  return {
    host: address.address,
    port: address.port,
    shutdown: async (): Promise<void> => {
      await new Promise<void>(
        (
          resolve: (value: void | PromiseLike<void>) => void,
          reject: (reason?: unknown) => void,
        ) => {
          application.close().then(
            () => {
              resolve();
            },
            (err: unknown) => {
              if (err === undefined) {
                resolve();
              } else {
                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                reject(err);
              }
            },
          );
        },
      );
    },
  };
}

export async function buildHonoServer(
  container: Container,
  errorFilterList: Newable<ErrorFilter>[],
  pipeList: (Newable<Pipe> | Pipe)[],
): Promise<Server> {
  const adapter: InversifyHonoHttpAdapter = new InversifyHonoHttpAdapter(
    container,
    { logger: true },
  );

  adapter.useGlobalFilters(...errorFilterList);
  adapter.useGlobalPipe(...pipeList);

  const application: Hono = await adapter.build();

  return new Promise<Server>(
    (resolve: (value: Server | PromiseLike<Server>) => void) => {
      const httpServer: ServerType = serve(
        {
          fetch: application.fetch,
          hostname: '0.0.0.0',
          port: 0,
        },
        (info: AddressInfo) => {
          const server: Server = {
            host: info.address,
            port: info.port,
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
        },
      );
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
  describe.each<
    [
      string,
      (
        container: Container,
        errorFilterList: Newable<ErrorFilter>[],
        pipeList: (Newable<Pipe> | Pipe)[],
      ) => Promise<Server>,
    ]
  >([
    ['an Express', buildExpressServer],
    ['an Express 4', buildExpress4Server],
    ['a Fastify', buildFastifyServer],
    ['a Hono', buildHonoServer],
  ])(
    'having %s server',
    (
      _: string,
      buildServer: (
        container: Container,
        errorFilterList: Newable<ErrorFilter>[],
        pipeList: (Newable<Pipe> | Pipe)[],
      ) => Promise<Server>,
    ) => {
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
            @ValidatedBody() message: Message | undefined,
          ): Promise<Message | undefined> {
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
            openapi: '3.1.0',
          };

          const swaggerProvider: SwaggerUiProvider = new SwaggerUiProvider({
            api: {
              openApiObject,
              path: '/docs',
            },
          });

          swaggerProvider.provide(container);

          server = await buildServer(
            container,
            [ValidationErrorFilter],
            [new OpenApiValidationPipe(swaggerProvider.openApiObject)],
          );
        });

        afterAll(async () => {
          await server.shutdown();
        });

        describe('when a valid POST /messages request with body is made', () => {
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

        describe('when a valid POST /messages request without body is made', () => {
          let response: Response;

          beforeAll(async () => {
            response = await fetch(
              `http://${server.host}:${server.port.toString()}/messages`,
              {
                method: 'POST',
              },
            );
          });

          it('should return expected Response', async () => {
            expect(response.status).toBe(200);
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
            required: true,
          })
          @Post()
          public async createItem(@ValidatedBody() item: Item): Promise<Item> {
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
            openapi: '3.1.0',
          };

          const swaggerProvider: SwaggerUiProvider = new SwaggerUiProvider({
            api: {
              openApiObject,
              path: '/docs',
            },
          });

          swaggerProvider.provide(container);

          server = await buildServer(
            container,
            [ValidationErrorFilter],
            [new OpenApiValidationPipe(swaggerProvider.openApiObject)],
          );
        });

        afterAll(async () => {
          await server.shutdown();
        });

        describe('when a POST /items request is made with no Content-Type header', () => {
          let response: Response;

          beforeAll(async () => {
            response = await fetch(
              `http://${server.host}:${server.port.toString()}/items`,
              {
                /*
                 * Trick to send a body without a Content-Type header since fetch silently
                 * adds 'Content-Type: text/plain;charset=UTF-8' otherwise
                 */
                body: new TextEncoder().encode(
                  JSON.stringify({ label: 'My Item' }),
                ),
                method: 'POST',
              },
            );
          });

          it('should return expected Response', async () => {
            expect(response.status).satisfy((status: number) =>
              [400, 415].includes(status),
            );
            await expect(response.json()).resolves.toMatchObject({
              message: expect.stringMatching(
                /(Unable to find schema for operation)|(Unsupported Media Type)/,
              ),
            });
          });
        });
      });

      describe('having an OpenApiValidationPipe (v3.1) with content-type ambiguity and schema id references', () => {
        interface Item {
          label: string;
        }

        @Controller('/items')
        class ItemController {
          @OasRequestBody({
            content: {
              'application/json': {
                schema: {
                  $ref: 'https://example.com/schemas/Item.json',
                },
              },
              'application/xml': {
                schema: {
                  $ref: 'https://example.com/schemas/Item.json',
                },
              },
            },
          })
          @Post()
          public async createItem(@ValidatedBody() item: Item): Promise<Item> {
            return item;
          }
        }

        let server: Server;

        beforeAll(async () => {
          const container: Container = new Container();

          container.bind(ValidationErrorFilter).toSelf().inSingletonScope();
          container.bind(ItemController).toSelf().inSingletonScope();

          const openApiObject: OpenApi3Dot1Object = {
            components: {
              schemas: {
                Item: {
                  $id: 'https://example.com/schemas/Item.json',
                  properties: { label: { type: 'string' } },
                  required: ['label'],
                  type: 'object',
                },
              },
            },
            info: { title: 'Test API', version: '1.0.0' },
            openapi: '3.1.0',
          };

          const swaggerProvider: SwaggerUiProvider = new SwaggerUiProvider({
            api: {
              openApiObject,
              path: '/docs',
            },
          });

          swaggerProvider.provide(container);

          server = await buildServer(
            container,
            [ValidationErrorFilter],
            [new OpenApiValidationPipe(swaggerProvider.openApiObject)],
          );
        });

        afterAll(async () => {
          await server.shutdown();
        });

        describe('when a POST /items request is made with Content-Type header', () => {
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

          it('should return expected Response', async () => {
            expect(response.status).toBe(200);
            expect(response.headers.get('content-type')).toStrictEqual(
              expect.stringContaining('application/json'),
            );
            await expect(response.json()).resolves.toStrictEqual({
              label: 'My Item',
            });
          });
        });
      });

      describe('having an OpenApiValidationPipe (v3.1) in an HTTP server with validated headers', () => {
        @Controller('/resources')
        class ResourceController {
          @OasParameter({
            in: 'header',
            name: 'x-request-id',
            required: true,
            schema: { type: 'string' },
          })
          @OasParameter({
            in: 'header',
            name: 'x-page-size',
            required: false,
            schema: { type: 'integer' },
          })
          @Get()
          public async getResources(
            @ValidatedHeaders() _headers: Record<string, unknown>,
          ): Promise<{ ok: boolean }> {
            return { ok: true };
          }
        }

        let server: Server;

        beforeAll(async () => {
          const container: Container = new Container();

          container.bind(ValidationErrorFilter).toSelf().inSingletonScope();
          container.bind(ResourceController).toSelf().inSingletonScope();

          const openApiObject: OpenApi3Dot1Object = {
            info: { title: 'Test API', version: '1.0.0' },
            openapi: '3.1.0',
          };

          const swaggerProvider: SwaggerUiProvider = new SwaggerUiProvider({
            api: {
              openApiObject,
              path: '/docs',
            },
          });

          swaggerProvider.provide(container);

          server = await buildServer(
            container,
            [ValidationErrorFilter],
            [new OpenApiValidationPipe(swaggerProvider.openApiObject)],
          );
        });

        afterAll(async () => {
          await server.shutdown();
        });

        describe('when a GET /resources request is made with valid headers', () => {
          let response: Response;

          beforeAll(async () => {
            response = await fetch(
              `http://${server.host}:${server.port.toString()}/resources`,
              {
                headers: { 'x-request-id': 'abc-123' },
                method: 'GET',
              },
            );
          });

          it('should return expected Response', async () => {
            expect(response.status).toBe(200);
            expect(response.headers.get('content-type')).toStrictEqual(
              expect.stringContaining('application/json'),
            );
            await expect(response.json()).resolves.toStrictEqual({ ok: true });
          });
        });

        describe('when a GET /resources request is made without the required header', () => {
          let response: Response;

          beforeAll(async () => {
            response = await fetch(
              `http://${server.host}:${server.port.toString()}/resources`,
              {
                method: 'GET',
              },
            );
          });

          it('should return expected Response', async () => {
            expect(response.status).toBe(400);
            await expect(response.json()).resolves.toStrictEqual({
              message: expect.stringContaining('x-request-id'),
            });
          });
        });

        describe('when a GET /resources request is made with an invalid integer header', () => {
          let response: Response;

          beforeAll(async () => {
            response = await fetch(
              `http://${server.host}:${server.port.toString()}/resources`,
              {
                headers: {
                  'x-page-size': 'not-a-number',
                  'x-request-id': 'abc-123',
                },
                method: 'GET',
              },
            );
          });

          it('should return expected Response', async () => {
            expect(response.status).toBe(400);
            await expect(response.json()).resolves.toStrictEqual({
              message: expect.stringContaining('x-page-size'),
            });
          });
        });
      });

      describe('having an OpenApiValidationPipe (v3.1) in an HTTP server with validated params', () => {
        @Controller('/users')
        class UserController {
          @OasParameter({
            in: 'path',
            name: 'userId',
            required: true,
            schema: { format: 'uuid', type: 'string' },
          })
          @Get('/:userId')
          public async getUser(
            @ValidatedParams() _params: Record<string, unknown>,
          ): Promise<{ ok: boolean }> {
            return { ok: true };
          }
        }

        let server: Server;

        beforeAll(async () => {
          const container: Container = new Container();

          container.bind(ValidationErrorFilter).toSelf().inSingletonScope();
          container.bind(UserController).toSelf().inSingletonScope();

          const openApiObject: OpenApi3Dot1Object = {
            info: { title: 'Test API', version: '1.0.0' },
            openapi: '3.1.0',
          };

          const swaggerProvider: SwaggerUiProvider = new SwaggerUiProvider({
            api: {
              openApiObject,
              path: '/docs',
            },
          });

          swaggerProvider.provide(container);

          server = await buildServer(
            container,
            [ValidationErrorFilter],
            [new OpenApiValidationPipe(swaggerProvider.openApiObject)],
          );
        });

        afterAll(async () => {
          await server.shutdown();
        });

        describe('when a GET /users/:userId request is made with a valid uuid param', () => {
          let response: Response;

          beforeAll(async () => {
            response = await fetch(
              `http://${server.host}:${server.port.toString()}/users/550e8400-e29b-41d4-a716-446655440000`,
              {
                method: 'GET',
              },
            );
          });

          it('should return expected Response', async () => {
            expect(response.status).toBe(200);
            expect(response.headers.get('content-type')).toStrictEqual(
              expect.stringContaining('application/json'),
            );
            await expect(response.json()).resolves.toStrictEqual({ ok: true });
          });
        });

        describe('when a GET /users/:userId request is made with an invalid uuid param', () => {
          let response: Response;

          beforeAll(async () => {
            response = await fetch(
              `http://${server.host}:${server.port.toString()}/users/not-a-uuid`,
              {
                method: 'GET',
              },
            );
          });

          it('should return expected Response', async () => {
            expect(response.status).toBe(400);
            await expect(response.json()).resolves.toStrictEqual({
              message: expect.stringContaining('userId'),
            });
          });
        });
      });

      describe('having an OpenApiValidationPipe (v3.1) in an HTTP server with validated query params', () => {
        @Controller('/products')
        class ProductController {
          @OasParameter({
            in: 'query',
            name: 'search',
            required: true,
            schema: {
              type: 'string',
            },
          })
          @OasParameter({
            in: 'query',
            name: 'limit',
            required: false,
            schema: {
              type: 'integer',
            },
          })
          @Get()
          public async getProducts(
            @ValidatedQuery() _query: Record<string, unknown>,
          ): Promise<{ ok: boolean }> {
            return { ok: true };
          }
        }

        let server: Server;

        beforeAll(async () => {
          const container: Container = new Container();

          container.bind(ValidationErrorFilter).toSelf().inSingletonScope();
          container.bind(ProductController).toSelf().inSingletonScope();

          const openApiObject: OpenApi3Dot1Object = {
            info: { title: 'Test API', version: '1.0.0' },
            openapi: '3.1.0',
          };

          const swaggerProvider: SwaggerUiProvider = new SwaggerUiProvider({
            api: {
              openApiObject,
              path: '/docs',
            },
          });

          swaggerProvider.provide(container);

          server = await buildServer(
            container,
            [ValidationErrorFilter],
            [new OpenApiValidationPipe(swaggerProvider.openApiObject)],
          );
        });

        afterAll(async () => {
          await server.shutdown();
        });

        describe('when a GET /products request is made with valid query params', () => {
          let response: Response;

          beforeAll(async () => {
            response = await fetch(
              `http://${server.host}:${server.port.toString()}/products?search=widget&limit=10`,
              {
                method: 'GET',
              },
            );
          });

          it('should return expected Response', async () => {
            expect(response.status).toBe(200);
            expect(response.headers.get('content-type')).toStrictEqual(
              expect.stringContaining('application/json'),
            );
            await expect(response.json()).resolves.toStrictEqual({ ok: true });
          });
        });

        describe('when a GET /products request is made without the required query param', () => {
          let response: Response;

          beforeAll(async () => {
            response = await fetch(
              `http://${server.host}:${server.port.toString()}/products`,
              {
                method: 'GET',
              },
            );
          });

          it('should return expected Response', async () => {
            expect(response.status).toBe(400);
            await expect(response.json()).resolves.toStrictEqual({
              message: expect.stringContaining('search'),
            });
          });
        });

        describe('when a GET /products request is made with an invalid integer query param', () => {
          let response: Response;

          beforeAll(async () => {
            response = await fetch(
              `http://${server.host}:${server.port.toString()}/products?search=widget&limit=not-a-number`,
              {
                method: 'GET',
              },
            );
          });

          it('should return expected Response', async () => {
            expect(response.status).toBe(400);
            await expect(response.json()).resolves.toStrictEqual({
              message: expect.stringContaining('limit'),
            });
          });
        });
      });

      describe('having an OpenApiValidationPipe (v3.1) in an HTTP server with an array of number query param', () => {
        @Controller('/numbers')
        class NumberController {
          @OasParameter({
            in: 'query',
            name: 'ids',
            required: true,
            schema: { items: { type: 'number' }, type: 'array' },
          })
          @Get()
          public async getNumbers(
            @ValidatedQuery() _query: Record<string, unknown>,
          ): Promise<{ ok: boolean }> {
            return { ok: true };
          }
        }

        let server: Server;

        beforeAll(async () => {
          const container: Container = new Container();

          container.bind(ValidationErrorFilter).toSelf().inSingletonScope();
          container.bind(NumberController).toSelf().inSingletonScope();

          const openApiObject: OpenApi3Dot1Object = {
            info: { title: 'Test API', version: '1.0.0' },
            openapi: '3.1.0',
          };

          const swaggerProvider: SwaggerUiProvider = new SwaggerUiProvider({
            api: {
              openApiObject,
              path: '/docs',
            },
          });

          swaggerProvider.provide(container);

          server = await buildServer(
            container,
            [ValidationErrorFilter],
            [new OpenApiValidationPipe(swaggerProvider.openApiObject)],
          );
        });

        afterAll(async () => {
          await server.shutdown();
        });

        describe('when a GET /numbers request is made with a valid array of number query param', () => {
          let response: Response;

          beforeAll(async () => {
            response = await fetch(
              `http://${server.host}:${server.port.toString()}/numbers?ids=1&ids=2&ids=3`,
              {
                method: 'GET',
              },
            );
          });

          it('should return expected Response', async () => {
            expect(response.status).toBe(200);
            expect(response.headers.get('content-type')).toStrictEqual(
              expect.stringContaining('application/json'),
            );
            await expect(response.json()).resolves.toStrictEqual({ ok: true });
          });
        });

        describe('when a GET /numbers request is made with an invalid array of number query param', () => {
          let response: Response;

          beforeAll(async () => {
            response = await fetch(
              `http://${server.host}:${server.port.toString()}/numbers?ids=1&ids=not-a-number&ids=3`,
              {
                method: 'GET',
              },
            );
          });

          it('should return expected Response', async () => {
            expect(response.status).toBe(400);
            await expect(response.json()).resolves.toStrictEqual({
              message: expect.stringContaining('ids'),
            });
          });
        });
      });

      describe('having an OpenApiValidationPipe (v3.1) in an HTTP server with an array or number query params', () => {
        @Controller('/products')
        class ProductController {
          @OasParameter({
            in: 'query',
            name: 'search',
            required: true,
            schema: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  items: { type: 'string' },
                  type: 'array',
                },
              ],
            },
          })
          @OasParameter({
            in: 'query',
            name: 'limit',
            required: false,
            schema: {
              anyOf: [
                {
                  type: 'integer',
                },
                {
                  items: { type: 'integer' },
                  type: 'array',
                },
              ],
            },
          })
          @Get()
          public async getProducts(
            @ValidatedQuery() _query: Record<string, unknown>,
          ): Promise<{ ok: boolean }> {
            return { ok: true };
          }
        }

        let server: Server;

        beforeAll(async () => {
          const container: Container = new Container();

          container.bind(ValidationErrorFilter).toSelf().inSingletonScope();
          container.bind(ProductController).toSelf().inSingletonScope();

          const openApiObject: OpenApi3Dot1Object = {
            info: { title: 'Test API', version: '1.0.0' },
            openapi: '3.1.0',
          };

          const swaggerProvider: SwaggerUiProvider = new SwaggerUiProvider({
            api: {
              openApiObject,
              path: '/docs',
            },
          });

          swaggerProvider.provide(container);

          server = await buildServer(
            container,
            [ValidationErrorFilter],
            [new OpenApiValidationPipe(swaggerProvider.openApiObject)],
          );
        });

        afterAll(async () => {
          await server.shutdown();
        });

        describe('when a GET /products request is made with valid query params', () => {
          let response: Response;

          beforeAll(async () => {
            response = await fetch(
              `http://${server.host}:${server.port.toString()}/products?search=widget&limit=10`,
              {
                method: 'GET',
              },
            );
          });

          it('should return expected Response', async () => {
            expect(response.status).toBe(200);
            expect(response.headers.get('content-type')).toStrictEqual(
              expect.stringContaining('application/json'),
            );
            await expect(response.json()).resolves.toStrictEqual({ ok: true });
          });
        });

        describe('when a GET /products request is made with valid array query params', () => {
          let response: Response;

          beforeAll(async () => {
            response = await fetch(
              `http://${server.host}:${server.port.toString()}/products?search=widget&search=widget2&limit=10&limit=20`,
              {
                method: 'GET',
              },
            );
          });

          it('should return expected Response', async () => {
            expect(response.status).toBe(200);
            expect(response.headers.get('content-type')).toStrictEqual(
              expect.stringContaining('application/json'),
            );
            await expect(response.json()).resolves.toStrictEqual({ ok: true });
          });
        });

        describe('when a GET /products request is made without the required query param', () => {
          let response: Response;

          beforeAll(async () => {
            response = await fetch(
              `http://${server.host}:${server.port.toString()}/products`,
              {
                method: 'GET',
              },
            );
          });

          it('should return expected Response', async () => {
            expect(response.status).toBe(400);
            await expect(response.json()).resolves.toStrictEqual({
              message: expect.stringContaining('search'),
            });
          });
        });

        describe('when a GET /products request is made with an invalid integer query param', () => {
          let response: Response;

          beforeAll(async () => {
            response = await fetch(
              `http://${server.host}:${server.port.toString()}/products?search=widget&limit=not-a-number`,
              {
                method: 'GET',
              },
            );
          });

          it('should return expected Response', async () => {
            expect(response.status).toBe(400);
            await expect(response.json()).resolves.toStrictEqual({
              message: expect.stringContaining('limit'),
            });
          });
        });
      });
    },
  );
});
