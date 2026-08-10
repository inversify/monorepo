import { beforeAll, describe, expect, it } from 'vitest';

import { type PnpmWorkspaceSourceModel } from '../models/PnpmWorkspaceSourceModel.js';
import { generatePnpmWorkspaceSource } from './generatePnpmWorkspaceSource.js';

describe(generatePnpmWorkspaceSource, () => {
  describe('having a base allowBuilds model', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        const model: PnpmWorkspaceSourceModel = {
          allowBuilds: {
            '@prisma/engines': true,
            '@scarf/scarf': true,
            prisma: true,
          },
        };

        result = generatePnpmWorkspaceSource(model);
      });

      it('should print allowBuilds without blockExoticSubdeps', () => {
        expect(result).toBe(`# Allow Prisma install scripts (pnpm 10+ blocks dependency build scripts by default).
allowBuilds:
  '@prisma/engines': true
  '@scarf/scarf': true
  prisma: true
`);
        expect(result).not.toContain('blockExoticSubdeps');
      });
    });
  });

  describe('having a model with blockExoticSubdeps disabled', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        const model: PnpmWorkspaceSourceModel = {
          allowBuilds: {
            '@prisma/engines': true,
            '@scarf/scarf': true,
            prisma: true,
          },
          blockExoticSubdeps: false,
        };

        result = generatePnpmWorkspaceSource(model);
      });

      it('should print blockExoticSubdeps after allowBuilds', () => {
        expect(result).toBe(`# Allow Prisma install scripts (pnpm 10+ blocks dependency build scripts by default).
allowBuilds:
  '@prisma/engines': true
  '@scarf/scarf': true
  prisma: true
# Allow git-hosted uWebSockets.js pulled in by @inversifyjs/http-uwebsockets.
blockExoticSubdeps: false
`);

        const allowBuildsIndex: number = result.indexOf('allowBuilds:');
        const blockExoticSubdepsIndex: number = result.indexOf(
          'blockExoticSubdeps: false',
        );

        expect(allowBuildsIndex).toBeGreaterThan(-1);
        expect(blockExoticSubdepsIndex).toBeGreaterThan(allowBuildsIndex);
      });
    });
  });
});
