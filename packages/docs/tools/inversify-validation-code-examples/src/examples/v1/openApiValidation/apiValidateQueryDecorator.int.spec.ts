import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { SwaggerUiProvider } from '@inversifyjs/http-open-api';
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';
import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { OpenApiValidationPipe } from '@inversifyjs/open-api-validation/v3Dot1';
import { Container } from 'inversify';

import { buildExpressServer } from '../../../server/adapter/express/actions/buildExpressServer.js';
import { type Server } from '../../../server/models/Server.js';
import { ProductController } from './apiValidateQueryDecorator.js';

describe('Validate Query Decorator (OpenAPI Validation)', () => {
  describe('having an OpenApiValidationPipe in an HTTP server with product query validation', () => {
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
      container.bind(ProductController).toSelf().inSingletonScope();

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

    describe('when a valid GET /products request is made with required query param', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/products?search=laptop`,
          {
            method: 'GET',
          },
        );
      });

      it('should return expected Response', async () => {
        expect(response.status).toBe(200);
        await expect(response.text()).resolves.toBe('Search: laptop');
      });
    });

    describe('when a valid GET /products request is made with required and optional query params', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/products?search=phone&limit=5`,
          {
            method: 'GET',
          },
        );
      });

      it('should return expected Response', async () => {
        expect(response.status).toBe(200);
        await expect(response.text()).resolves.toBe('Search: phone');
      });
    });

    describe('when an invalid GET /products request is made with limit below minimum', () => {
      let response: Response;

      beforeAll(async () => {
        response = await fetch(
          `http://${server.host}:${server.port.toString()}/products?search=tablet&limit=0`,
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
