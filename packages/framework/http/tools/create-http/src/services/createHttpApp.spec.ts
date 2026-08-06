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

        await expect(
          fs.readFile(path.join(projectPath, 'tsconfig.json'), 'utf8'),
        ).resolves.toContain('"outDir": "./dist"');
        await expect(
          fs.readFile(path.join(projectPath, 'eslint.config.mjs'), 'utf8'),
        ).resolves.toContain('typescript-eslint');
        await expect(
          fs.readFile(path.join(projectPath, 'prettier.config.mjs'), 'utf8'),
        ).resolves.toContain('trailingComma');
        await expect(
          fs.readFile(path.join(projectPath, 'src/index.ts'), 'utf8'),
        ).resolves.toBe('');

        expect(packageJson).toMatchObject({
          name: 'demo-app',
          packageManager: 'pnpm@11.18.0',
          scripts: {
            build: 'tsc',
            format: 'prettier --write ./src',
            lint: 'eslint ./src',
          },
        });
        expect(
          (packageJson as { devDependencies: Record<string, string> })
            .devDependencies,
        ).toMatchObject({
          eslint: expect.any(String) as string,
          prettier: expect.any(String) as string,
          typescript: expect.any(String) as string,
        });
      });
    });
  });
});
