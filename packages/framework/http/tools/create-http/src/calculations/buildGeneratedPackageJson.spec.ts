import { beforeAll, describe, expect, it } from 'vitest';

import { DbAdapter } from '../models/DbAdapter.js';
import { PackageManager } from '../models/PackageManager.js';
import { buildGeneratedPackageJson } from './buildGeneratedPackageJson.js';

describe(buildGeneratedPackageJson, () => {
  describe('having a package name, package manager, and dependency maps', () => {
    describe('when called with prisma+postgresql', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildGeneratedPackageJson(
          'demo-app',
          PackageManager.pnpm,
          '11.18.0',
          {
            inversify: '8.2.3',
          },
          {
            typescript: '6.0.3',
          },
          DbAdapter.prismaPostgresql,
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
            build: 'prisma generate && tsc',
            'db:generate': 'prisma generate',
            'db:migrate': 'prisma migrate deploy',
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

  describe('having yarn dependenciesMeta', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildGeneratedPackageJson(
          'demo-app',
          PackageManager.yarn,
          '4.18.0',
          {
            inversify: '8.2.3',
          },
          {
            typescript: '6.0.3',
          },
          DbAdapter.prismaPostgresql,
          {
            prisma: {
              built: true,
            },
          },
        );
      });

      it('should include dependenciesMeta in the generated package.json', () => {
        expect(result).toMatchObject({
          dependenciesMeta: {
            prisma: {
              built: true,
            },
          },
          packageManager: 'yarn@4.18.0',
        });
      });
    });
  });
});
