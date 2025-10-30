import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';
import { StandardSchemaValidationPipe } from '@inversifyjs/standard-schema-validation';
import { Container } from 'inversify';

import { buildExpressServer } from '../../../server/adapter/express/actions/buildExpressServer';
import { Server } from '../../../server/models/Server';
import { MessageController } from './gettingStarted';

describe('Getting started', () => {
  describe('having a StandardSchemaValidationPipe in an HTTP server with validated endpoints', () => {
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
