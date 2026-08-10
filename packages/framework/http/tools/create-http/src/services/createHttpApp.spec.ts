import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

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
          dbAdapter: 'prisma+postgresql',
          httpAdapter: 'express',
          packageManager: 'pnpm',
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
          "import { TodoContainerModule } from '../../todo/adapter/inversify/TodoContainerModule.js';",
        );
        expect(bootstrapSource).toContain(
          "import { TodoPrismaContainerModule } from '../../todo/adapter/inversify/TodoPrismaContainerModule.js';",
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
          "import { OpenApiValidationPipe } from '@inversifyjs/open-api-validation/v3Dot2';",        );
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
              'src/status/controllers/StatusController.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain("@OasTag('Status')");
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/status/containerModules/StatusContainerModule.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain(
          'options.bind(StatusController).toSelf().inSingletonScope();',
        );
        await expect(
          fs.readFile(
            path.join(projectPath, 'src/status/models/StatusResponse.ts'),
            'utf8',
          ),
        ).resolves.toContain('export class StatusResponse');

        await expect(
          fs.readFile(
            path.join(projectPath, 'src/todo/domain/models/Todo.ts'),
            'utf8',
          ),
        ).resolves.toContain('export class Todo');
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
        ).resolves.toContain('@ValidatedBody() body: CreateTodoRequestBody');
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
            path.join(
              projectPath,
              'src/todo/api/models/CreateTodoRequestBody.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain('export class CreateTodoRequestBody');
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/api/models/PaginatedTodosResponse.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain('export class PaginatedTodosResponse');
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/api/models/UpdateTodoRequestBody.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain('export class UpdateTodoRequestBody');
        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/todo/adapter/prisma/PrismaTodoPersistenceAdapter.ts',
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
              'src/todo/adapter/inversify/TodoContainerModule.ts',
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
              'src/todo/adapter/inversify/TodoPrismaContainerModule.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain('todoPersistencePortIdentifier');

        expect(gitIgnoreContents).toContain('node_modules/');
        expect(gitIgnoreContents).toContain('generated/');
        expect(gitIgnoreContents).toContain('src/generated/');
        expect(gitIgnoreContents).toContain('npm-debug.log*');
        expect(gitIgnoreContents).toContain('yarn-debug.log*');
        expect(gitIgnoreContents).toContain('.pnpm-debug.log*');
        expect(gitIgnoreContents).toContain('.yarn/*');
        expect(gitIgnoreContents).toContain('.pnpm-store/');

        const envContents: string = await fs.readFile(
          path.join(projectPath, '.env'),
          'utf8',
        );

        expect(envContents).toContain('NODE_ENV=development');
        expect(envContents).toContain('PORT=3000');
        expect(envContents).toContain('DATABASE_URL=');

        const envExampleContents: string = await fs.readFile(
          path.join(projectPath, '.env.example'),
          'utf8',
        );

        expect(envExampleContents).toContain('NODE_ENV=development');
        expect(envExampleContents).toContain('PORT=3000');
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
            '@inversifyjs/open-api-validation': expect.any(String) as string,
            '@inversifyjs/prisma': expect.any(String) as string,
            '@prisma/adapter-pg': expect.any(String) as string,
            '@prisma/client': expect.any(String) as string,
            ajv: expect.any(String) as string,
            'ajv-formats': expect.any(String) as string,
            express: expect.any(String) as string,
            inversify: expect.any(String) as string,
            pg: expect.any(String) as string,
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
});
