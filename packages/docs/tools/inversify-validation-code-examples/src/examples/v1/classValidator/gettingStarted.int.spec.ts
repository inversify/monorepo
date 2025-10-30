import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ClassValidationPipe } from '@inversifyjs/class-validation';
import {
  BadRequestHttpResponse,
  CatchError,
  ErrorFilter,
} from '@inversifyjs/http-core';
import { InversifyValidationError } from '@inversifyjs/validation-common';
import { Container } from 'inversify';

import { buildExpressServer } from '../../../server/adapter/express/actions/buildExpressServer';
import { Server } from '../../../server/models/Server';
import { MessageController } from './gettingStarted';

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

describe('Getting started', () => {
  describe('having a ClassValidationPipe in an HTTP server with validated endpoints', () => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();

      container.bind(ValidationErrorFilter).toSelf().inSingletonScope();
      container.bind(MessageController).toSelf().inSingletonScope();

      server = await buildExpressServer(
        container,
        [ValidationErrorFilter],
        [new ClassValidationPipe()],
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
              content: 123, // Should be a string
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          },
        );
      });

      it('should return a Bad Request response', async () => {
        expect(response.status).toBe(400);
      });
    });
  });
});
