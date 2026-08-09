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

      it('should generate initializeContainer and adapter bootstrap', () => {
        expect(result).toContain(
          "import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';",
        );
        expect(result).toContain("import type express from 'express';");
        expect(result).toContain("import { Container } from 'inversify';");
        expect(result).toContain(
          "import { StatusContainerModule } from '../../status/containerModules/StatusContainerModule.js';",
        );
        expect(result).toContain("from '@inversifyjs/config'");
        expect(result).toContain('ConfigContainerModule');
        expect(result).toContain('ConfigService');
        expect(result).toContain('configServiceIdentifier');
        expect(result).toContain(
          "import { envFile } from '@inversifyjs/config-dotenv';",
        );
        expect(result).toContain("import { z } from 'zod';");
        expect(result).toContain('appConfigSchema');
        expect(result).toContain(
          'type AppConfig = z.infer<typeof appConfigSchema>',
        );
        expect(result).toContain('configModule');
        expect(result).toContain(
          'async function initializeContainer(): Promise<Container>',
        );
        expect(result).toContain(
          'const container: Container = new Container();',
        );
        expect(result).toContain('await container.loadAsync(configModule);');
        expect(result).toContain(
          'container.load(new StatusContainerModule());',
        );
        expect(result).toContain('return container;');
        expect(result).not.toContain('export function initializeContainer');
        expect(result).not.toContain(
          'export async function initializeContainer',
        );
        expect(result).toContain(
          'export async function bootstrap(): Promise<void>',
        );
        expect(result).toContain(
          'const container: Container = await initializeContainer();',
        );
        expect(result).toContain('configServiceIdentifier');
        expect(result).toContain('const { PORT } = configService.get();');
        expect(result).toContain(
          'const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(',
        );
        expect(result).toContain(
          'const app: express.Application = await adapter.build();',
        );
        expect(result).toContain('app.listen(PORT,');
        expect(result).toMatch(
          /^ {2}const container: Container = new Container\(\);$/m,
        );
        expect(result).toMatch(/^ {2}NODE_ENV:/m);
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
      });
    });
  });

  describe('having extra initializeContainer body statements', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(async () => {
        result =
          await BootstrapSourceFixtures.withUseCaseExtraInitializeContainerBodyStatements();
      });

      it('should include the extra statements after loading the config module', () => {
        expect(result).toContain('await container.loadAsync(configModule);');
        expect(result).toContain('container.load(new UserContainerModule());');

        const containerIndex: number = result.indexOf(
          'const container: Container = new Container();',
        );
        const configLoadIndex: number = result.indexOf(
          'await container.loadAsync(configModule);',
        );
        const loadIndex: number = result.indexOf(
          'container.load(new UserContainerModule());',
        );
        const returnIndex: number = result.indexOf('return container;');

        expect(containerIndex).toBeGreaterThan(-1);
        expect(configLoadIndex).toBeGreaterThan(containerIndex);
        expect(loadIndex).toBeGreaterThan(configLoadIndex);
        expect(returnIndex).toBeGreaterThan(loadIndex);
      });
    });
  });
});
