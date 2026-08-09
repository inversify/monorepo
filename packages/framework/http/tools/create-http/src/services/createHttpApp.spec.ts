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

        await expect(
          fs.readFile(path.join(projectPath, 'tsconfig.json'), 'utf8'),
        ).resolves.toContain('"outDir": "./dist"');

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
        expect(bootstrapSource).toContain(
          'container.load(new StatusContainerModule());',
        );
        expect(bootstrapSource).toContain(
          'const container: Container = await initializeContainer();',
        );
        expect(bootstrapSource).toContain(
          'const { PORT } = configService.get();',
        );

        await expect(
          fs.readFile(
            path.join(
              projectPath,
              'src/status/controllers/StatusController.ts',
            ),
            'utf8',
          ),
        ).resolves.toContain('export class StatusController');
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
        ).resolves.toContain('export interface StatusResponse');

        expect(gitIgnoreContents).toContain('node_modules/');
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

        const envExampleContents: string = await fs.readFile(
          path.join(projectPath, '.env.example'),
          'utf8',
        );

        expect(envExampleContents).toContain('NODE_ENV=development');
        expect(envExampleContents).toContain('PORT=3000');

        expect(packageJson).toMatchObject({
          dependencies: {
            '@inversifyjs/config': expect.any(String) as string,
            '@inversifyjs/config-dotenv': expect.any(String) as string,
            '@inversifyjs/http-core': expect.any(String) as string,
            '@inversifyjs/http-express': expect.any(String) as string,
            express: expect.any(String) as string,
            inversify: expect.any(String) as string,
            zod: expect.any(String) as string,
          },
          name: 'demo-app',
          packageManager: expect.stringMatching(/^pnpm@/) as string,
          scripts: {
            build: 'tsc',
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
          eslint: expect.any(String) as string,
          'eslint-config-prettier': expect.any(String) as string,
          'eslint-plugin-prettier': expect.any(String) as string,
          prettier: expect.any(String) as string,
          typescript: expect.any(String) as string,
        });
      });
    });
  });
});
