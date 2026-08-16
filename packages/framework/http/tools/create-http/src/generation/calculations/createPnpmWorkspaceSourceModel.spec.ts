import { beforeAll, describe, expect, it } from 'vitest';

import { HttpAdapter } from '../../models/HttpAdapter.js';
import { createPnpmWorkspaceSourceModel } from './createPnpmWorkspaceSourceModel.js';

describe(createPnpmWorkspaceSourceModel, () => {
  describe('having the express adapter', () => {
    describe('when called', () => {
      let result: ReturnType<typeof createPnpmWorkspaceSourceModel>;

      beforeAll(() => {
        result = createPnpmWorkspaceSourceModel(HttpAdapter.express);
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
        result = createPnpmWorkspaceSourceModel(HttpAdapter.uwebsockets);
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
