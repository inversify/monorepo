import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ClassValidationPipe } from '@inversifyjs/class-validation';
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';
import { Container } from 'inversify';

import { buildExpressServer } from '../../../server/adapter/express/actions/buildExpressServer.js';
import { type Server } from '../../../server/models/Server.js';
import { MessageController } from './gettingStarted.js';

describe('Getting started', () => {
  describe('having a ClassValidationPipe in an HTTP server with validated endpoints', () => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();

      container
        .bind(InversifyValidationErrorFilter)
        .toSelf()
        .inSingletonScope();
      container.bind(MessageController).toSelf().inSingletonScope();

      server = await buildExpressServer(
        container,
        [InversifyValidationErrorFilter],
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
