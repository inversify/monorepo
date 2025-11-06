import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { Server } from '../../server/models/Server';
import { buildSwaggerUiController } from './buildSwaggerUiController';

describe(buildSwaggerUiController, () => {
  describe.each<[string, (container: Container) => Promise<Server>]>([
    ['an express', buildExpressServer],
    ['an express4', buildExpress4Server],
    ['a fastify', buildFastifyServer],
    ['a hono', buildHonoServer],
  ])(
    'having %s http server',
    (_: string, buildServer: (container: Container) => Promise<Server>) => {
      let apiPathFixture: string;
      let specFixture: OpenApi3Dot1Object;

      let server: Server;

      beforeAll(async () => {
        apiPathFixture = '/api';
        specFixture = {
          info: {
            title: 'Test API',
            version: '1.0.0',
          },
          openapi: '3.1.0',
        };

        const container: Container = new Container();
        const controller: NewableFunction = buildSwaggerUiController({
          api: {
            openApiObject: specFixture,
            path: apiPathFixture,
          },
        });

        container.bind(controller).toSelf().inSingletonScope();

        server = await buildServer(container);
      });

      afterAll(async () => {
        await server.shutdown();
      });

      describe('when called GET /', () => {
        let response: Response;

        beforeAll(async () => {
          response = await fetch(
            `http://${server.host}:${server.port.toString()}${apiPathFixture}`,
            {
              method: 'GET',
            },
          );

          await response.text(); // consume body to avoid keeping the connection open
        });

        it('should return an "text/html" Content-Type header', () => {
          expect(response.headers.get('Content-Type')).toStrictEqual(
            expect.stringContaining('text/html'),
          );
        });

        it('should return a 200 response', async () => {
          expect(response.status).toBe(200);
        });
      });

      describe.each<[string]>([
        ['swagger-initializer.js'],
        ['swagger-ui-bundle.js'],
        ['swagger-ui-es-bundle-core.js'],
        ['swagger-ui-es-bundle.js'],
        ['swagger-ui-standalone-preset.js'],
        ['swagger-ui.js'],
      ])('when called GET /resources/%s', (resource: string) => {
        let response: Response;

        beforeAll(async () => {
          response = await fetch(
            `http://${server.host}:${server.port.toString()}${apiPathFixture}/resources/${resource}`,
            {
              method: 'GET',
            },
          );

          await response.text(); // consume body to avoid keeping the connection open
        });

        it('should return an "text/javascript" Content-Type header', () => {
          expect(response.headers.get('Content-Type')).toStrictEqual(
            expect.stringContaining('text/javascript'),
          );
        });

        it('should return a 200 response', async () => {
          expect(response.status).toBe(200);
        });
      });

      describe('when called GET /spec', () => {
        let response: Response;
        let responseJsonBody: unknown;

        beforeAll(async () => {
          response = await fetch(
            `http://${server.host}:${server.port.toString()}${apiPathFixture}/spec`,
            {
              method: 'GET',
            },
          );
          responseJsonBody = await response.json();
        });

        it('should return an "application/json" Content-Type header', () => {
          expect(response.headers.get('Content-Type')).toStrictEqual(
            expect.stringContaining('application/json'),
          );
        });

        it('should return a 200 response', async () => {
          expect(response.status).toBe(200);
        });

        it('should return the OpenAPI spec', async () => {
          expect(responseJsonBody).toStrictEqual(specFixture);
        });
      });
    },
  );
});
