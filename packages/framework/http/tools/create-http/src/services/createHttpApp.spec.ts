import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { DbAdapter } from '../models/DbAdapter.js';
import { HttpAdapter } from '../models/HttpAdapter.js';
import { PackageManager } from '../models/PackageManager.js';
import { createHttpApp } from './createHttpApp.js';

describe(createHttpApp, () => {
  describe('having a target path and pnpm package manager', () => {
    describe('when called', () => {
      let projectPath: string;
      let temporaryRoot: string;

      beforeAll(async () => {
        temporaryRoot = await fs.mkdtemp(
          path.join(os.tmpdir(), 'create-http-'),
        );
        projectPath = path.join(temporaryRoot, 'demo-app');

        await createHttpApp({
          dbAdapter: DbAdapter.prismaPostgresql,
          httpAdapter: HttpAdapter.express,
          packageManager: PackageManager.pnpm,
          targetPath: projectPath,
        });
      });

      afterAll(async () => {
        await fs.rm(temporaryRoot, { force: true, recursive: true });
      });

      it('should create the expected project files', async () => {
        const packageJson: unknown = JSON.parse(
          await fs.readFile(path.join(projectPath, 'package.json'), 'utf8'),
        );

        const gitIgnoreContents: string = await fs.readFile(
          path.join(projectPath, '.gitignore'),
          'utf8',
        );

        const agentSkillContents: string = await fs.readFile(
          path.join(projectPath, '.agents/skills/add-resource/SKILL.md'),
          'utf8',
        );
        const claudeSkillContents: string = await fs.readFile(
          path.join(projectPath, '.claude/skills/add-resource/SKILL.md'),
          'utf8',
        );

        expect(claudeSkillContents).toBe(agentSkillContents);
        expect(agentSkillContents).toContain('name: add-resource');
        expect(agentSkillContents).toContain('prisma/schema.prisma');
        expect(agentSkillContents).toContain(
          'Keep HTTP decorators and request models out of domain and application layers.',
        );

        const tsconfigContents: string = await fs.readFile(
          path.join(projectPath, 'tsconfig.json'),
          'utf8',
        );

        expect(tsconfigContents).toContain('"outDir": "./dist"');
        expect(tsconfigContents).toContain('"emitDecoratorMetadata": true');
        expect(tsconfigContents).toContain('"experimentalDecorators": true');
        expect(tsconfigContents).toContain('"types": ["node"]');

        const eslintConfigContents: string = await fs.readFile(
          path.join(projectPath, 'eslint.config.mjs'),
          'utf8',
        );

        expect(eslintConfigContents).toContain('typescript-eslint');
        expect(eslintConfigContents).toContain(
          "import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'",
        );
        expect(eslintConfigContents).toContain(
          'eslintPluginPrettierRecommended',
        );
        expect(eslintConfigContents).toContain("ignores: ['src/generated/**']");

        await expect(
          fs.readFile(path.join(projectPath, 'prettier.config.mjs'), 'utf8'),
        ).resolves.toContain('trailingComma');

        const indexSource: string = await fs.readFile(
          path.join(projectPath, 'src/index.ts'),
          'utf8',
        );

        expect(indexSource).toContain(
          "import { bootstrap } from './app/scripts/bootstrap.js';",
        );
        expect(indexSource).toContain('await bootstrap();');

        const bootstrapSource: string = await fs.readFile(
          path.join(projectPath, 'src/app/scripts/bootstrap.ts'),
          'utf8',
        );

        expect(bootstrapSource).toContain(
          'async function initializeContainer(): Promise<Container>',
        );
        expect(bootstrapSource).toContain(
          'export async function bootstrap(): Promise<void>',
        );
        expect(bootstrapSource).toContain('InversifyExpressHttpAdapter');
        expect(bootstrapSource).toContain(
          'const app: express.Application = await adapter.build();',
        );
        expect(bootstrapSource).toContain("from '@inversifyjs/config'");
        expect(bootstrapSource).toContain('ConfigContainerModule');
        expect(bootstrapSource).toContain('configServiceIdentifier');
        expect(bootstrapSource).toMatch(
          /^ {2}const container: Container = new Container\(\);$/m,
        );
        expect(bootstrapSource).toContain(
          "import { envFile } from '@inversifyjs/config-dotenv';",
        );
        expect(bootstrapSource).toContain("import { z } from 'zod';");
        expect(bootstrapSource).toContain(
          'await container.loadAsync(configModule);',
        );
        expect(bootstrapSource).toContain('DATABASE_URL');
        expect(bootstrapSource).toContain('LOG_LEVELS');
        expect(bootstrapSource).toContain("from '@inversifyjs/logger'");
        expect(bootstrapSource).toContain('LoggerContainerModule');
        expect(bootstrapSource).toContain('loggerFactoryIdentifier');
        expect(bootstrapSource).toContain(
          "const logger: Logger = loggerFactory('Bootstrap');",
        );
        expect(bootstrapSource).toContain('logger.info(');
        expect(bootstrapSource).not.toContain('console.log');
        expect(bootstrapSource).toContain(
          "import { PrismaContainerModule } from '@inversifyjs/prisma';",
        );
        expect(bootstrapSource).toContain(
          "import { PrismaPg } from '@prisma/adapter-pg';",
        );
        expect(bootstrapSource).toContain(
          "import { PrismaClient } from '../../generated/prisma/client.js';",
        );
        expect(bootstrapSource).toContain(
          "import { StatusContainerModule } from '../../status/adapter/inversify/containerModules/StatusContainerModule.js';",
        );
        expect(bootstrapSource).toContain(
          "import { TodoContainerModule } from '../../todo/adapter/inversify/containerModules/TodoContainerModule.js';",
        );
        expect(bootstrapSource).toContain(
          "import { TodoPrismaContainerModule } from '../../todo/adapter/inversify/containerModules/TodoPrismaContainerModule.js';",
        );
        expect(bootstrapSource).toContain(
          'container.load(new StatusContainerModule());',
        );
        expect(bootstrapSource).toContain(
          'container.load(new TodoContainerModule());',
        );
        expect(bootstrapSource).toContain(
          'container.load(new TodoPrismaContainerModule());',
        );
        expect(bootstrapSource).toContain(
          'const container: Container = await initializeContainer();',
        );
        expect(bootstrapSource).toContain(
          'const { PORT } = configService.get();',
        );
        expect(bootstrapSource).toContain(
          "import { SwaggerUiProvider } from '@inversifyjs/http-open-api/v3Dot2';",
        );
        expect(bootstrapSource).toContain(
          "import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';",
        );
        expect(bootstrapSource).toContain(
          "import { OpenApiValidationPipe } from '@inversifyjs/open-api-validation/v3Dot2';",
        );
        expect(bootstrapSource).toContain(
          'const swaggerProvider: SwaggerUiProvider = new SwaggerUiProvider({',
        );
        expect(bootstrapSource).toContain("path: '/docs'");
        expect(bootstrapSource).toContain(
          'swaggerProvider.provide(container);',
        );
        expect(bootstrapSource).toContain('adapter.useGlobalPipe(');
        expect(bootstrapSource).toContain(
          'new OpenApiValidationPipe(swaggerProvider.openApiObject)',
        );
        expect(bootstrapSource).toContain(
          'adapter.useGlobalFilters(InversifyValidationErrorFilter);',
        );

        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/logger/containerModules/LoggerContainerModule.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain('return new ConsoleLogger(context, options);');
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/logger/models/loggerFactoryIdentifier.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain('loggerFactoryIdentifier');

        await expect(
          fs.readFile(
            path.join(projectPath, 'src/status/domain/models/Status.ts'),
            'utf8',
          ),
        ).resolves.toContain('export class Status');
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/status/api/controllers/StatusController.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain("@Controller('/v1/status')");
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/status/api/controllers/StatusController.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain("@OasTag('Status')");
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/status/adapter/inversify/containerModules/StatusContainerModule.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain(
          'options.bind(StatusController).toSelf().inSingletonScope();',
        );
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/status/adapter/inversify/containerModules/StatusContainerModule.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain(
          'options.bind(StatusV1FromStatusBuilder).toSelf().inSingletonScope();',
        );
        await expect(
          fs.readFile(
            path.join(projectPath, 'src/status/api/models/StatusV1.ts'),
            'utf8',
          ),
        ).resolves.toContain('export class StatusV1');
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/status/api/builders/StatusV1FromStatusBuilder.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain(
          'export class StatusV1FromStatusBuilder implements Builder<Status, StatusV1>',
        );

        await expect(
          fs.readFile(
            path.join(projectPath, 'src/todo/domain/models/Todo.ts'),
            'utf8',
          ),
        ).resolves.toContain('export class Todo');
        await expect(
          fs.readFile(
            path.join(projectPath, 'src/todo/domain/models/Todo.ts'),
            'utf8',
          ),
        ).resolves.toContain('public createdAt!: Date');
        await expect(
          fs.readFile(
            path.join(projectPath, 'src/common/domain/modules/Builder.ts'),
            'utf8',
          ),
        ).resolves.toContain('export interface Builder<TInput, TOutput>');
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/application/ports/TodoPersistencePort.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain('export interface TodoPersistencePort');
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/api/controllers/TodoController.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain("@Controller('/v1/todos')");
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/api/controllers/TodoController.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain('@ValidatedBody() body: CreateTodoV1RequestBody');
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/api/controllers/TodoController.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain('@Get()');
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/api/controllers/TodoController.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain("@Get('/:id')");
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/api/controllers/TodoController.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain("@Patch('/:id')");
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/api/controllers/TodoController.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain("@Delete('/:id')");
        await expect(
          fs.readFile(
            path.join(projectPath, 'src/todo/api/models/TodoV1.ts'),
            'utf8',
          ),
        ).resolves.toContain('export class TodoV1');
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/api/models/CreateTodoV1RequestBody.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain('export class CreateTodoV1RequestBody');
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/api/models/PaginatedTodosV1Response.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain('export class PaginatedTodosV1Response');
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/api/models/UpdateTodoV1RequestBody.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain('export class UpdateTodoV1RequestBody');
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/api/builders/TodoV1FromTodoBuilder.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain(
          'export class TodoV1FromTodoBuilder implements Builder<Todo, TodoV1>',
        );
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/adapter/prisma/adapters/PrismaTodoPersistenceAdapter.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain(
          'export class PrismaTodoPersistenceAdapter implements TodoPersistencePort',
        );
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/adapter/prisma/builders/TodoFromPrismaTodoBuilder.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain(
          'export class TodoFromPrismaTodoBuilder implements Builder<PrismaTodo, Todo>',
        );
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/adapter/inversify/containerModules/TodoContainerModule.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain(
          'options.bind(TodoController).toSelf().inSingletonScope();',
        );
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/adapter/inversify/containerModules/TodoContainerModule.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain(
          'options.bind(TodoV1FromTodoBuilder).toSelf().inSingletonScope();',
        );
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/adapter/inversify/containerModules/TodoPrismaContainerModule.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain('todoPersistencePortIdentifier');
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/adapter/inversify/containerModules/TodoPrismaContainerModule.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain(
          'options.bind(TodoFromPrismaTodoBuilder).toSelf().inSingletonScope();',
        );

        expect(gitIgnoreContents).toContain('node_modules/');
        expect(gitIgnoreContents).toContain('generated/');
        expect(gitIgnoreContents).toContain('src/generated/');
        expect(gitIgnoreContents).toContain('npm-debug.log*');
        expect(gitIgnoreContents).toContain('yarn-debug.log*');
        expect(gitIgnoreContents).toContain('.pnpm-debug.log*');
        expect(gitIgnoreContents).toContain('.yarn/*');
        expect(gitIgnoreContents).toContain('!.yarn/releases');
        expect(gitIgnoreContents).toContain('.pnpm-store/');

        const envContents: string = await fs.readFile(
          path.join(projectPath, '.env'),
          'utf8',
        );

        expect(envContents).toContain('NODE_ENV=development');
        expect(envContents).toContain('PORT=3000');
        expect(envContents).toContain('LOG_LEVELS=error,warn,info');
        expect(envContents).toContain('DATABASE_URL=');

        const envExampleContents: string = await fs.readFile(
          path.join(projectPath, '.env.example'),
          'utf8',
        );

        expect(envExampleContents).toContain('NODE_ENV=development');
        expect(envExampleContents).toContain('PORT=3000');
        expect(envExampleContents).toContain('LOG_LEVELS=error,warn,info');
        expect(envExampleContents).toContain('DATABASE_URL=');

        const dockerComposeContents: string = await fs.readFile(
          path.join(projectPath, 'docker-compose.yml'),
          'utf8',
        );

        expect(dockerComposeContents).toMatch(/image:\s*postgres:\d+-alpine/);
        expect(dockerComposeContents).toContain("'127.0.0.1:5432:5432'");
        expect(dockerComposeContents).toMatch(
          /^\s*- postgres_data:\/var\/lib\/postgresql$/m,
        );

        const pnpmWorkspaceContents: string = await fs.readFile(
          path.join(projectPath, 'pnpm-workspace.yaml'),
          'utf8',
        );

        expect(pnpmWorkspaceContents).toContain('allowBuilds:');
        expect(pnpmWorkspaceContents).toContain('prisma: true');
        expect(pnpmWorkspaceContents).toContain("'@prisma/engines': true");
        expect(pnpmWorkspaceContents).not.toContain('blockExoticSubdeps');

        const prismaConfigContents: string = await fs.readFile(
          path.join(projectPath, 'prisma.config.ts'),
          'utf8',
        );

        expect(prismaConfigContents).toContain("import 'dotenv/config'");
        expect(prismaConfigContents).toContain("from 'prisma/config'");

        const prismaSchema: string = await fs.readFile(
          path.join(projectPath, 'prisma/schema.prisma'),
          'utf8',
        );

        expect(prismaSchema).toContain(
          'provider               = "prisma-client"',
        );
        expect(prismaSchema).toContain(
          'output                 = "../src/generated/prisma"',
        );
        expect(prismaSchema).toContain('moduleFormat           = "esm"');
        expect(prismaSchema).toContain('generatedFileExtension = "ts"');
        expect(prismaSchema).toContain('importFileExtension    = "js"');
        expect(prismaSchema).toContain('provider = "postgresql"');
        expect(prismaSchema).toContain('model Todo');
        expect(prismaSchema).toContain('description');
        expect(prismaSchema).toContain('deleted_at');

        expect(packageJson).toMatchObject({
          dependencies: {
            '@inversifyjs/config': expect.any(String) as string,
            '@inversifyjs/config-dotenv': expect.any(String) as string,
            '@inversifyjs/http-core': expect.any(String) as string,
            '@inversifyjs/http-express': expect.any(String) as string,
            '@inversifyjs/http-open-api': expect.any(String) as string,
            '@inversifyjs/http-validation': expect.any(String) as string,
            '@inversifyjs/logger': expect.any(String) as string,
            '@inversifyjs/open-api-validation': expect.any(String) as string,
            '@inversifyjs/prisma': expect.any(String) as string,
            '@prisma/adapter-pg': expect.any(String) as string,
            '@prisma/client': expect.any(String) as string,
            ajv: expect.any(String) as string,
            'ajv-formats': expect.any(String) as string,
            express: expect.any(String) as string,
            inversify: expect.any(String) as string,
            pg: expect.any(String) as string,
            winston: expect.any(String) as string,
            zod: expect.any(String) as string,
          },
          name: 'demo-app',
          packageManager: expect.stringMatching(/^pnpm@/) as string,
          scripts: {
            build: 'prisma generate && tsc',
            'db:generate': 'prisma generate',
            'db:migrate': 'prisma migrate deploy',
            format: 'prettier --write ./src',
            lint: 'eslint ./src',
            serve: 'node ./dist/index.js',
          },
        });
        expect(
          (packageJson as { dependencies: Record<string, string> })
            .dependencies,
        ).not.toHaveProperty('fastify');
        expect(
          (packageJson as { dependencies: Record<string, string> })
            .dependencies,
        ).not.toHaveProperty('@inversifyjs/http-fastify');
        expect(
          (packageJson as { devDependencies: Record<string, string> })
            .devDependencies,
        ).toMatchObject({
          '@types/express': expect.any(String) as string,
          dotenv: expect.any(String) as string,
          eslint: expect.any(String) as string,
          'eslint-config-prettier': expect.any(String) as string,
          'eslint-plugin-prettier': expect.any(String) as string,
          prettier: expect.any(String) as string,
          prisma: expect.any(String) as string,
          typescript: expect.any(String) as string,
        });
      });
    });
  });

  describe('having a target path and yarn package manager', () => {
    describe('when called', () => {
      let projectPath: string;
      let temporaryRoot: string;

      beforeAll(async () => {
        temporaryRoot = await fs.mkdtemp(
          path.join(os.tmpdir(), 'create-http-yarn-'),
        );
        projectPath = path.join(temporaryRoot, 'demo-app');

        await createHttpApp({
          dbAdapter: DbAdapter.prismaPostgresql,
          httpAdapter: HttpAdapter.express,
          packageManager: PackageManager.yarn,
          targetPath: projectPath,
        });
      });

      afterAll(async () => {
        await fs.rm(temporaryRoot, { force: true, recursive: true });
      });

      it('should pin Yarn Berry and write .yarnrc.yml', async () => {
        const packageJson: unknown = JSON.parse(
          await fs.readFile(path.join(projectPath, 'package.json'), 'utf8'),
        );

        expect(packageJson).toMatchObject({
          dependenciesMeta: {
            '@prisma/engines': {
              built: true,
            },
            '@scarf/scarf': {
              built: true,
            },
            prisma: {
              built: true,
            },
          },
          name: 'demo-app',
          packageManager: expect.stringMatching(/^yarn@/) as string,
        });

        const yarnRcContents: string = await fs.readFile(
          path.join(projectPath, '.yarnrc.yml'),
          'utf8',
        );

        expect(yarnRcContents).toContain('enableScripts: false');
        expect(yarnRcContents).toContain('nodeLinker: node-modules');
        expect(yarnRcContents).not.toContain('dependenciesMeta:');

        await expect(
          fs.access(path.join(projectPath, 'pnpm-workspace.yaml')),
        ).rejects.toMatchObject({
          code: 'ENOENT',
        });
      });
    });
  });
});
