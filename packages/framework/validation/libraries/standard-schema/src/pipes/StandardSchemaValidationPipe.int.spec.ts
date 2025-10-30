import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import http, { RequestListener } from 'node:http';
import { AddressInfo } from 'node:net';

import { CatchError, ErrorFilter, Pipe } from '@inversifyjs/framework-core';
import {
  BadRequestHttpResponse,
  Body,
  Controller,
  Post,
} from '@inversifyjs/http-core';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { InversifyValidationError } from '@inversifyjs/validation-common';
import express from 'express';
import { Container, Newable } from 'inversify';
import zod from 'zod';

import { ValidateStandardSchemaV1 } from '../decorators/ValidateStandardSchemaV1';
import { StandardSchemaValidationPipe } from './StandardSchemaValidationPipe';

export interface Server {
  host: string;
  port: number;
  shutdown: () => Promise<void>;
}

export async function buildExpressServer(
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
    throw new BadRequestHttpResponse({ message: error.message }, undefined, {
      cause: error,
    });
  }
}

describe(StandardSchemaValidationPipe, () => {
  describe('having a StandardSchemaValidationPipe in an HTTP server with validated endpoints', () => {
    interface Message {
      content: string;
    }

    @Controller('/messages')
    class MessageController {
      @Post()
      public async createMessage(
        @Body()
        @ValidateStandardSchemaV1(
          zod.object({ content: zod.string().max(100) }).strict(),
        )
        message: Message,
      ): Promise<Message> {
        return message;
      }
    }

    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();

      container.bind(ValidationErrorFilter).toSelf().inSingletonScope();
      container.bind(MessageController).toSelf().inSingletonScope();

      server = await buildExpressServer(
        container,
        [ValidationErrorFilter],
        [new StandardSchemaValidationPipe()],
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
            body: JSON.stringify({
              content: 'Hello, world!',
            }),
            headers: {
              'Content-Type': 'application/json',
            },
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
              someExtraProperty: 'This should not be here',
            }),
            headers: {
              'Content-Type': 'application/json',
            },
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
          message: expect.stringContaining(
            'Unrecognized key: "someExtraProperty"',
          ),
        });
      });
    });
  });
});
