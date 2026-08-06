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
        await expect(
          fs.readFile(path.join(projectPath, 'eslint.config.mjs'), 'utf8'),
        ).resolves.toContain('typescript-eslint');
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
          'function initializeContainer(): Container',
        );
        expect(bootstrapSource).toContain(
          'export async function bootstrap(): Promise<void>',
        );
        expect(bootstrapSource).toContain('InversifyExpressHttpAdapter');
        expect(bootstrapSource).toContain(
          'const app: express.Application = await adapter.build();',
        );
        expect(bootstrapSource).toContain(
          "import { StatusContainerModule } from '../../status/containerModules/StatusContainerModule.js';",
        );
        expect(bootstrapSource).toContain(
          'container.load(new StatusContainerModule());',
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

        expect(packageJson).toMatchObject({
          dependencies: {
            '@inversifyjs/http-core': '5.4.8',
            '@inversifyjs/http-express': '5.4.8',
            express: '5.2.1',
            inversify: '8.2.3',
          },
          name: 'demo-app',
          packageManager: 'pnpm@11.18.0',
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
          '@types/express': '5.0.6',
          eslint: expect.any(String) as string,
          prettier: expect.any(String) as string,
          typescript: expect.any(String) as string,
        });
      });
    });
  });
});
