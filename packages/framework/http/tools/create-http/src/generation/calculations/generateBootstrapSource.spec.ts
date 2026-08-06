import { beforeAll, describe, expect, it } from 'vitest';

import { BootstrapSourceFixtures } from '../fixtures/BootstrapSourceFixtures.js';
import { generateBootstrapSource } from './generateBootstrapSource.js';

describe(generateBootstrapSource, () => {
  describe('having an express bootstrap source model', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = BootstrapSourceFixtures.withHttpAdapterExpress;
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
        expect(result).toContain('const PORT: number = 3000;');
        expect(result).toContain('function initializeContainer(): Container');
        expect(result).toContain(
          'const container: Container = new Container();',
        );
        expect(result).toContain(
          'container.load(new StatusContainerModule());',
        );
        expect(result).toContain('return container;');
        expect(result).not.toContain('export function initializeContainer');
        expect(result).toContain(
          'export async function bootstrap(): Promise<void>',
        );
        expect(result).toContain(
          'const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(',
        );
        expect(result).toContain(
          'const app: express.Application = await adapter.build();',
        );
        expect(result).toContain('app.listen(PORT,');
      });
    });
  });

  describe('having a fastify bootstrap source model', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = BootstrapSourceFixtures.withHttpAdapterFastify;
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
      });
    });
  });

  describe('having a hono bootstrap source model', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = BootstrapSourceFixtures.withHttpAdapterHono;
      });

      it('should generate a Hono adapter bootstrap with node-server serve', () => {
        expect(result).toContain("import { serve } from '@hono/node-server';");
        expect(result).toContain(
          "import { InversifyHonoHttpAdapter } from '@inversifyjs/http-hono';",
        );
        expect(result).toContain('const app: Hono = await adapter.build();');
        expect(result).toContain('fetch: app.fetch,');
        expect(result).toContain('port: PORT,');
      });
    });
  });

  describe('having a uwebsockets bootstrap source model', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = BootstrapSourceFixtures.withHttpAdapterUwebsockets;
      });

      it('should generate a uWebSockets adapter bootstrap', () => {
        expect(result).toContain(
          "import { InversifyUwebSocketsHttpAdapter } from '@inversifyjs/http-uwebsockets';",
        );
        expect(result).toContain('const app = await adapter.build();');
        expect(result).toContain("app.listen('0.0.0.0', PORT,");
        expect(result).toContain('if (socket !== false)');
      });
    });
  });

  describe('having extra initializeContainer body statements', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result =
          BootstrapSourceFixtures.withUseCaseExtraInitializeContainerBodyStatements;
      });

      it('should include the extra statements before returning', () => {
        expect(result).toContain('container.load(new UserContainerModule());');

        const containerIndex: number = result.indexOf(
          'const container: Container = new Container();',
        );
        const loadIndex: number = result.indexOf(
          'container.load(new UserContainerModule());',
        );
        const returnIndex: number = result.indexOf('return container;');

        expect(containerIndex).toBeGreaterThan(-1);
        expect(loadIndex).toBeGreaterThan(containerIndex);
        expect(returnIndex).toBeGreaterThan(loadIndex);
      });
    });
  });
});
