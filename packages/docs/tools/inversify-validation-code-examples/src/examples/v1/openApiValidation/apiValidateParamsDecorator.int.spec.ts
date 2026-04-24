import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { SwaggerUiProvider } from '@inversifyjs/http-open-api';
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';
import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { OpenApiValidationPipe } from '@inversifyjs/open-api-validation/v3Dot1';
import { Container } from 'inversify';

import { buildExpressServer } from '../../../server/adapter/express/actions/buildExpressServer.js';
import { type Server } from '../../../server/models/Server.js';
import { UserController } from './apiValidateParamsDecorator.js';

describe('Validate Params Decorator (OpenAPI Validation)', () => {
  describe('having an OpenApiValidationPipe in an HTTP server with user param validation', () => {
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

    describe('when a valid GET /users/:userId request is made with a UUID', () => {
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
        await expect(response.text()).resolves.toBe(
          'User ID: 550e8400-e29b-41d4-a716-446655440000',
        );
      });
    });

    describe('when an invalid GET /users/:userId request is made with a non-UUID value', () => {
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
      });
    });
  });
});
