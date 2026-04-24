import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { SwaggerUiProvider } from '@inversifyjs/http-open-api';
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';
import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { OpenApiValidationPipe } from '@inversifyjs/open-api-validation/v3Dot1';
import { Container } from 'inversify';

import { buildExpressServer } from '../../../server/adapter/express/actions/buildExpressServer.js';
import { type Server } from '../../../server/models/Server.js';
import { ResourceController } from './apiValidateHeadersDecorator.js';

describe('Validate Headers Decorator (OpenAPI Validation)', () => {
  describe('having an OpenApiValidationPipe in an HTTP server with resource header validation', () => {
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
      container.bind(ResourceController).toSelf().inSingletonScope();

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

    describe('when a valid GET /resources request is made with required header', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/resources`,
          {
            headers: {
              'x-request-id': 'abc-123',
            },
            method: 'GET',
          },
        );
      });

      it('should return expected Response', async () => {
        expect(response.status).toBe(200);
        await expect(response.text()).resolves.toBe('Request ID: abc-123');
      });
    });

    describe('when a valid GET /resources request is made with required and optional headers', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/resources`,
          {
            headers: {
              'x-page-size': '10',
              'x-request-id': 'abc-456',
            },
            method: 'GET',
          },
        );
      });

      it('should return expected Response', async () => {
        expect(response.status).toBe(200);
        await expect(response.text()).resolves.toBe('Request ID: abc-456');
      });
    });

    describe('when an invalid GET /resources request is made without required x-request-id header', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/resources`,
          {
            method: 'GET',
          },
        );
      });

      it('should return expected Response', async () => {
        expect(response.status).toBe(400);
      });
    });

    describe('when an invalid GET /resources request is made with x-page-size below minimum', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/resources`,
          {
            headers: {
              'x-page-size': '0',
              'x-request-id': 'abc-789',
            },
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
