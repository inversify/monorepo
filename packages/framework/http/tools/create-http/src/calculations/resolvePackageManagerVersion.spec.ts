import { beforeAll, describe, expect, it } from 'vitest';

import { type PackageManagersVersions } from '../models/PackageManagersVersions.js';
import { resolvePackageManagerVersion } from './resolvePackageManagerVersion.js';

describe(resolvePackageManagerVersion, () => {
  describe('having npm, pnpm, and yarn berry catalog versions', () => {
    let packageManagersVersionsFixture: PackageManagersVersions;
    let yarnBerryVersionFixture: string;

    beforeAll(() => {
      packageManagersVersionsFixture = {
        npm: '12.0.2',
        pnpm: '11.20.0',
      };
      yarnBerryVersionFixture = '4.18.0';
    });

    describe.each([
      ['npm', '12.0.2'],
      ['pnpm', '11.20.0'],
      ['yarn', '4.18.0'],
    ] as const)(
      'having package manager %s',
      (packageManager: 'npm' | 'pnpm' | 'yarn', expectedVersion: string) => {
        describe('when called', () => {
          let result: string;

          beforeAll(() => {
            result = resolvePackageManagerVersion(
              packageManager,
              packageManagersVersionsFixture,
              yarnBerryVersionFixture,
            );
          });

          it('should return the catalog version for that package manager', () => {
            expect(result).toBe(expectedVersion);
          });
        });
      },
    );
  });
});
