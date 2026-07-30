import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ClassValidationPipe } from '@inversifyjs/class-validation';
import { Container } from 'inversify';

import { buildExpressServer } from '../../../server/adapter/express/actions/buildExpressServer.js';
import { type Server } from '../../../server/models/Server.js';
import {
  CustomClassValidationErrorFilter,
  UserController,
} from './customValidationErrorFilter.js';

describe(CustomClassValidationErrorFilter, () => {
  describe('having a ClassValidationPipe with a custom validation error filter', () => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();

      container
        .bind(CustomClassValidationErrorFilter)
        .toSelf()
        .inSingletonScope();
      container.bind(UserController).toSelf().inSingletonScope();

      server = await buildExpressServer(
        container,
        [CustomClassValidationErrorFilter],
        [new ClassValidationPipe()],
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
              firstName: 'Jane',
              lastName: 'Doe',
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
        await expect(response.json()).resolves.toStrictEqual({
          firstName: 'Jane',
          lastName: 'Doe',
        });
      });
    });

    describe('when an invalid POST /users request is made', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/users`,
          {
            body: JSON.stringify({
              firstName: '',
              lastName: '',
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          },
        );
      });

      it('should return a field-mapped validation error body', async () => {
        expect(response.status).toBe(400);
        expect(response.headers.get('content-type')).toStrictEqual(
          expect.stringContaining('application/json'),
        );
        await expect(response.json()).resolves.toStrictEqual({
          errors: {
            firstName: 'First name is required',
            lastName: 'Last name is required',
          },
          message: 'Validation failed',
          success: false,
        });
      });
    });
  });
});
