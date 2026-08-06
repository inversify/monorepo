import { beforeAll, describe, expect, it } from 'vitest';

import { buildGeneratedPackageJson } from './buildGeneratedPackageJson.js';

describe(buildGeneratedPackageJson, () => {
  describe('having a package name, package manager, and dependency maps', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildGeneratedPackageJson(
          'demo-app',
          'pnpm',
          '11.18.0',
          {
            inversify: '8.2.3',
          },
          {
            typescript: '6.0.3',
          },
        );
      });

      it('should return a package.json with scripts, packageManager, and dependencies', () => {
        expect(result).toStrictEqual({
          dependencies: {
            inversify: '8.2.3',
          },
          devDependencies: {
            typescript: '6.0.3',
          },
          name: 'demo-app',
          packageManager: 'pnpm@11.18.0',
          private: true,
          scripts: {
            build: 'tsc',
            format: 'prettier --write ./src',
            lint: 'eslint ./src',
            serve: 'node ./dist/index.js',
          },
          type: 'module',
          version: '0.1.0',
        });
      });
    });
  });
});
