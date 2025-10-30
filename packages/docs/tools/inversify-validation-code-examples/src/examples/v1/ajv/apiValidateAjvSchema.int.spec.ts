import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AjvValidationPipe } from '@inversifyjs/ajv-validation';
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Container } from 'inversify';

import { buildExpressServer } from '../../../server/adapter/express/actions/buildExpressServer';
import { Server } from '../../../server/models/Server';
import { UserController } from './apiValidateAjvSchema';

describe('ValidateAjvSchema API', () => {
  describe('having an AjvValidationPipe in an HTTP server with ValidateAjvSchema decorated endpoints', () => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();
      const ajv: Ajv = new Ajv();
      addFormats(ajv);

      container
        .bind(InversifyValidationErrorFilter)
        .toSelf()
        .inSingletonScope();
      container.bind(UserController).toSelf().inSingletonScope();

      server = await buildExpressServer(
        container,
        [InversifyValidationErrorFilter],
        [new AjvValidationPipe(ajv)],
      );
    });

    afterAll(async () => {
      await server.shutdown();
    });

    describe('when a valid POST /users request is made', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/users`,
          {
            body: JSON.stringify({
              age: 25,
              email: 'john.doe@example.com',
              name: 'John Doe',
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
          age: 25,
          email: 'john.doe@example.com',
          name: 'John Doe',
        });
      });
    });

    describe('when an invalid POST /users request is made (missing required field)', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/users`,
          {
            body: JSON.stringify({
              name: 'John Doe',
              // Missing required email field
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
          message: expect.stringContaining('email'),
        });
      });
    });

    describe('when an invalid POST /users request is made (invalid email format)', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/users`,
          {
            body: JSON.stringify({
              email: 'invalid-email',
              name: 'John Doe',
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
          message: expect.stringContaining('format'),
        });
      });
    });
  });
});
