import { beforeAll, describe, expect, it } from 'vitest';

import { BootstrapSourceFixtures } from '../fixtures/BootstrapSourceFixtures.js';
import { generateBootstrapSource } from './generateBootstrapSource.js';

describe(generateBootstrapSource, () => {
  describe('having an express bootstrap source model', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(async () => {
        result = await BootstrapSourceFixtures.withHttpAdapterExpress();
      });

      it('should generate adapter bootstrap that reuses initializeContainer and provideOpenApi', () => {
        expect(result).toContain(
          "import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';",
        );
        expect(result).toContain("import type express from 'express';");
        expect(result).toContain("import { Container } from 'inversify';");
        expect(result).toContain("from './initializeContainer.js'");
        expect(result).toContain('initializeContainer');
        expect(result).toContain('AppConfig');
        expect(result).toContain(
          "import { provideOpenApi } from './provideOpenApi.js';",
        );
        expect(result).toContain("from '@inversifyjs/config'");
        expect(result).toContain('ConfigService');
        expect(result).toContain('configServiceIdentifier');
        expect(result).toContain("from '@inversifyjs/logger'");
        expect(result).toContain(
          "import { loggerFactoryIdentifier } from '../../logger/models/loggerFactoryIdentifier.js';",
        );
        expect(result).toContain(
          "import { SwaggerUiProvider } from '@inversifyjs/http-open-api/v3Dot2';",
        );
        expect(result).toContain(
          "import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';",
        );
        expect(result).toContain(
          "import { OpenApiValidationPipe } from '@inversifyjs/open-api-validation/v3Dot2';",
        );
        expect(result).not.toContain('appConfigSchema');
        expect(result).not.toContain('ConfigContainerModule');
        expect(result).not.toContain(
          'export async function initializeContainer',
        );
        expect(result).not.toContain('async function initializeContainer');
        expect(result).toContain(
          'export async function bootstrap(): Promise<void>',
        );
        expect(result).toContain(
          'const container: Container = await initializeContainer();',
        );
        expect(result).toContain(
          'container.bind(InversifyValidationErrorFilter).toSelf().inSingletonScope();',
        );
        expect(result).toContain('const { PORT } = configService.get();');
        expect(result).toContain(
          'const loggerFactory: (context: string) => Logger = container.get(',
        );
        expect(result).toContain('loggerFactoryIdentifier,');
        expect(result).toContain(
          "const logger: Logger = loggerFactory('Bootstrap');",
        );
        expect(result).toContain(
          'logger.info(`Server listening on http://localhost:${String(PORT)}`);',
        );
        expect(result).not.toContain('console.log');
        expect(result).toContain(
          'const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(',
        );
        expect(result).toContain(
          'const swaggerProvider: SwaggerUiProvider = provideOpenApi(container);',
        );
        expect(result).not.toContain('new SwaggerUiProvider({');
        expect(result).not.toContain('swaggerProvider.provide(container);');
        expect(result).toContain('adapter.useGlobalPipe(');
        expect(result).toContain(
          'new OpenApiValidationPipe(swaggerProvider.openApiObject)',
        );
        expect(result).toContain(
          'adapter.useGlobalFilters(InversifyValidationErrorFilter);',
        );
        expect(result).toContain(
          'const app: express.Application = await adapter.build();',
        );
        expect(result).toContain('app.listen(PORT,');

        const adapterIndex: number = result.indexOf(
          'const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(',
        );
        const provideIndex: number = result.indexOf(
          'const swaggerProvider: SwaggerUiProvider = provideOpenApi(container);',
        );
        const validationPipeIndex: number = result.indexOf(
          'adapter.useGlobalPipe(',
        );
        const buildIndex: number = result.indexOf(
          'const app: express.Application = await adapter.build();',
        );

        expect(adapterIndex).toBeGreaterThan(-1);
        expect(provideIndex).toBeGreaterThan(adapterIndex);
        expect(validationPipeIndex).toBeGreaterThan(provideIndex);
        expect(buildIndex).toBeGreaterThan(validationPipeIndex);
      });
    });
  });

  describe('having a fastify bootstrap source model', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(async () => {
        result = await BootstrapSourceFixtures.withHttpAdapterFastify();
      });

      it('should generate a Fastify adapter bootstrap', () => {
        expect(result).toContain(
          "import { InversifyFastifyHttpAdapter } from '@inversifyjs/http-fastify';",
        );
        expect(result).toContain(
          'const app: FastifyInstance = await adapter.build();',
        );
        expect(result).toContain(
          "await app.listen({ host: '0.0.0.0', port: PORT });",
        );
        expect(result).toContain('const { PORT } = configService.get();');
        expect(result).toContain(
          'logger.info(`Server listening on http://localhost:${String(PORT)}`);',
        );
        expect(result).not.toContain('console.log');
      });
    });
  });

  describe('having a hono bootstrap source model', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(async () => {
        result = await BootstrapSourceFixtures.withHttpAdapterHono();
      });

      it('should generate a Hono adapter bootstrap with node-server serve', () => {
        expect(result).toContain("import { serve } from '@hono/node-server';");
        expect(result).toContain(
          "import { InversifyHonoHttpAdapter } from '@inversifyjs/http-hono';",
        );
        expect(result).toContain('const app: Hono = await adapter.build();');
        expect(result).toContain('fetch: app.fetch,');
        expect(result).toContain('port: PORT,');
        expect(result).toContain('const { PORT } = configService.get();');
        expect(result).toContain(
          'logger.info(`Server listening on http://localhost:${String(PORT)}`);',
        );
        expect(result).not.toContain('console.log');
      });
    });
  });

  describe('having a uwebsockets bootstrap source model', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(async () => {
        result = await BootstrapSourceFixtures.withHttpAdapterUwebsockets();
      });

      it('should generate a uWebSockets adapter bootstrap', () => {
        expect(result).toContain(
          "import { InversifyUwebSocketsHttpAdapter } from '@inversifyjs/http-uwebsockets';",
        );
        expect(result).toContain('const app = await adapter.build();');
        expect(result).toContain("app.listen('0.0.0.0', PORT,");
        expect(result).toContain('if (socket !== false)');
        expect(result).toContain('const { PORT } = configService.get();');
        expect(result).toContain(
          'logger.info(`Server listening on http://localhost:${String(PORT)}`);',
        );
        expect(result).toContain("logger.error('Failed to start server');");
        expect(result).not.toContain('console.log');
        expect(result).not.toContain('console.error');
      });
    });
  });
});
