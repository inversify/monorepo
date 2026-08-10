import { beforeAll, describe, expect, it } from 'vitest';

import { createPnpmWorkspaceSourceModel } from './createPnpmWorkspaceSourceModel.js';

describe(createPnpmWorkspaceSourceModel, () => {
  describe('having the express adapter', () => {
    describe('when called', () => {
      let result: ReturnType<typeof createPnpmWorkspaceSourceModel>;

      beforeAll(() => {
        result = createPnpmWorkspaceSourceModel('express');
      });

      it('should include Prisma allowBuilds without blockExoticSubdeps', () => {
        expect(result).toStrictEqual({
          allowBuilds: {
            '@prisma/engines': true,
            '@scarf/scarf': true,
            prisma: true,
          },
        });
        expect(result).not.toHaveProperty('blockExoticSubdeps');
      });
    });
  });

  describe('having the uwebsockets adapter', () => {
    describe('when called', () => {
      let result: ReturnType<typeof createPnpmWorkspaceSourceModel>;

      beforeAll(() => {
        result = createPnpmWorkspaceSourceModel('uwebsockets');
      });

      it('should disable blockExoticSubdeps for the git-hosted uWebSockets.js dependency', () => {
        expect(result).toStrictEqual({
          allowBuilds: {
            '@prisma/engines': true,
            '@scarf/scarf': true,
            prisma: true,
          },
          blockExoticSubdeps: false,
        });
      });
    });
  });
});
