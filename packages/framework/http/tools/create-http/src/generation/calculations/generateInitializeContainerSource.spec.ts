import { beforeAll, describe, expect, it } from 'vitest';

import { InitializeContainerSourceFixtures } from '../fixtures/InitializeContainerSourceFixtures.js';
import { generateInitializeContainerSource } from './generateInitializeContainerSource.js';

describe(generateInitializeContainerSource, () => {
  describe('having a prisma+postgresql initialize container source model', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(async () => {
        result =
          await InitializeContainerSourceFixtures.withDbAdapterPrismaPostgresql();
      });

      it('should generate an exported initializeContainer that loads config and resource modules', () => {
        expect(result).toContain("import { Container } from 'inversify';");
        expect(result).toContain(
          "import { StatusContainerModule } from '../../status/adapter/inversify/containerModules/StatusContainerModule.js';",
        );
        expect(result).toContain(
          "import { PrismaContainerModule } from '@inversifyjs/prisma';",
        );
        expect(result).toContain(
          "import { PrismaPg } from '@prisma/adapter-pg';",
        );
        expect(result).toContain(
          "import { PrismaClient } from '../../generated/prisma/client.js';",
        );
        expect(result).toContain(
          "import { TodoContainerModule } from '../../todo/adapter/inversify/containerModules/TodoContainerModule.js';",
        );
        expect(result).toContain(
          "import { TodoPrismaContainerModule } from '../../todo/adapter/inversify/containerModules/TodoPrismaContainerModule.js';",
        );
        expect(result).toContain(
          "import { LoggerContainerModule } from '../../logger/containerModules/LoggerContainerModule.js';",
        );
        expect(result).toContain("from '@inversifyjs/config'");
        expect(result).toContain('ConfigContainerModule');
        expect(result).toContain('ConfigService');
        expect(result).toContain('configServiceIdentifier');
        expect(result).toContain("from '@inversifyjs/logger'");
        expect(result).toContain('LogLevel');
        expect(result).toContain(
          "import { envFile } from '@inversifyjs/config-dotenv';",
        );
        expect(result).toContain("import { z } from 'zod';");
        expect(result).toContain('appConfigSchema');
        expect(result).toContain('DATABASE_URL: z.string().min(1)');
        expect(result).toContain('LOG_LEVELS:');
        expect(result).toContain("default('error,warn,info')");
        expect(result).toContain('LogLevel.ERROR');
        expect(result).toContain('LogLevel.SILLY');
        expect(result).toContain(
          'export type AppConfig = z.infer<typeof appConfigSchema>',
        );
        expect(result).toContain('configModule');
        expect(result).toContain('ConfigObject');
        expect(result).toContain(
          'ConfigContainerModule.fromOptions<AppConfig>({',
        );
        expect(result).toContain(
          'validate: (input: ConfigObject): AppConfig => appConfigSchema.parse(input)',
        );
        expect(result).toContain(
          'export async function initializeContainer(): Promise<Container>',
        );
        expect(result).toContain(
          'const container: Container = new Container();',
        );
        expect(result).toContain('await container.loadAsync(configModule);');
        expect(result).toContain('const { LOG_LEVELS } = configService.get();');
        expect(result).toContain(
          'container.load(new LoggerContainerModule({ logTypes: LOG_LEVELS }));',
        );
        expect(result).toContain(
          'const { DATABASE_URL } = configService.get();',
        );
        expect(result).toContain('new PrismaContainerModule({');
        expect(result).toContain(
          'container.load(new StatusContainerModule());',
        );
        expect(result).toContain('container.load(new TodoContainerModule());');
        expect(result).toContain(
          'container.load(new TodoPrismaContainerModule());',
        );
        expect(result).toContain('return container;');
        expect(result).not.toContain('export async function bootstrap');
        expect(result).toMatch(
          /^ {2}const container: Container = new Container\(\);$/m,
        );
        expect(result).toMatch(/^ {2}DATABASE_URL:/m);
        expect(result).toMatch(/^ {2}NODE_ENV:/m);
      });
    });
  });

  describe('having extra initializeContainer body statements', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(async () => {
        result =
          await InitializeContainerSourceFixtures.withUseCaseExtraInitializeContainerBodyStatements();
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
