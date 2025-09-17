import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  BadRequestHttpResponse,
  CatchError,
  ErrorFilter,
} from '@inversifyjs/http-core';
import { StandardSchemaValidationPipe } from '@inversifyjs/standard-schema-validation';
import { InversifyValidationError } from '@inversifyjs/validation-common';
import { Container } from 'inversify';

import { buildExpressServer } from '../../../server/adapter/express/actions/buildExpressServer';
import { Server } from '../../../server/models/Server';
import { MessageController } from './gettingStarted';

@CatchError(InversifyValidationError)
class ValidationErrorFilter implements ErrorFilter<InversifyValidationError> {
  public catch(error: InversifyValidationError): never {
    throw new BadRequestHttpResponse(error.message, undefined, {
      cause: error,
    });
  }
}

describe('Getting started', () => {
  describe('having a StandardSchemaValidationPipe in an HTTP server with validated endpoints', () => {
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
          error: 'Bad Request',
          message: expect.stringContaining(
            'Unrecognized key: "someExtraProperty"',
          ),
          statusCode: 400,
        });
      });
    });
  });
});
