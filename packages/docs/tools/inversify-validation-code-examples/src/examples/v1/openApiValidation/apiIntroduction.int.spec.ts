import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { SwaggerUiProvider } from '@inversifyjs/http-open-api';
import { OpenApiValidationPipe } from '@inversifyjs/http-openapi-validation/v3Dot1';
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';
import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { Container } from 'inversify';

import { buildExpressServer } from '../../../server/adapter/express/actions/buildExpressServer.js';
import { type Server } from '../../../server/models/Server.js';
import { UserController } from './apiIntroduction.js';

describe('API Introduction (OpenAPI Validation)', () => {
  describe('having an OpenApiValidationPipe in an HTTP server with Quick Start user validation', () => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();

      const openApiObject: OpenApi3Dot1Object = {
        info: { title: 'My API', version: '1.0.0' },
        openapi: '3.1.1',
      };

      const swaggerProvider: SwaggerUiProvider = new SwaggerUiProvider({
        api: {
          openApiObject,
          path: '/docs',
        },
      });

      container
        .bind(InversifyValidationErrorFilter)
        .toSelf()
        .inSingletonScope();
      container.bind(UserController).toSelf().inSingletonScope();

      swaggerProvider.provide(container);

      server = await buildExpressServer(
        container,
        [InversifyValidationErrorFilter],
        [new OpenApiValidationPipe(swaggerProvider.openApiObject)],
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
        await expect(response.text()).resolves.toBe('Created user: Jane Doe');
      });
    });

    describe('when an invalid POST /users request is made', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/users`,
          {
            body: JSON.stringify({
              email: 'jane.doe@example.com',
              extra: 'not allowed',
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
        expect(response.status).toBe(400);
      });
    });
  });
});
