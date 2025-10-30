import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AjvValidationPipe } from '@inversifyjs/ajv-validation';
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Container } from 'inversify';

import { buildExpressServer } from '../../../server/adapter/express/actions/buildExpressServer';
import { Server } from '../../../server/models/Server';
import { UserController } from './apiIntroduction';

describe('API Introduction (AJV)', () => {
  describe('having an AjvValidationPipe in an HTTP server with Quick Start user validation', () => {
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
              age: 30,
              email: 'jane.doe@example.com',
              name: 'Jane Doe',
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
          expect.stringContaining('text/html'),
        );
        await expect(response.text()).resolves.toBe('Created user: Jane Doe');
      });
    });

    describe('when a valid POST /users request is made (without optional age)', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/users`,
          {
            body: JSON.stringify({
              email: 'john.smith@example.com',
              name: 'John Smith',
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
          expect.stringContaining('text/html'),
        );
        await expect(response.text()).resolves.toBe('Created user: John Smith');
      });
    });

    describe('when an invalid POST /users request is made (missing name)', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/users`,
          {
            body: JSON.stringify({
              email: 'test@example.com',
              // Missing required name field
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
          message: expect.stringContaining('name'),
        });
      });
    });

    describe('when an invalid POST /users request is made (invalid email)', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/users`,
          {
            body: JSON.stringify({
              email: 'not-an-email',
              name: 'Test User',
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

    describe('when an invalid POST /users request is made (negative age)', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/users`,
          {
            body: JSON.stringify({
              age: -5,
              email: 'test@example.com',
              name: 'Test User',
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
          message: expect.stringContaining('minimum'),
        });
      });
    });
  });
});
