import { beforeAll, describe, expect, it } from 'vitest';

import { ApiStyle } from '../../models/ApiStyle.js';
import { HttpAdapter } from '../../models/HttpAdapter.js';
import { createPnpmWorkspaceSourceModel } from './createPnpmWorkspaceSourceModel.js';

describe(createPnpmWorkspaceSourceModel, () => {
  describe('having the express adapter', () => {
    describe('when called', () => {
      let result: ReturnType<typeof createPnpmWorkspaceSourceModel>;

      beforeAll(() => {
        result = createPnpmWorkspaceSourceModel(
          HttpAdapter.express,
          ApiStyle.codeFirst,
        );
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
        expect(result.allowBuilds).not.toHaveProperty('esbuild');
      });
    });
  });

  describe('having the express adapter and schema-first', () => {
    describe('when called', () => {
      let result: ReturnType<typeof createPnpmWorkspaceSourceModel>;

      beforeAll(() => {
        result = createPnpmWorkspaceSourceModel(
          HttpAdapter.express,
          ApiStyle.schemaFirst,
        );
      });

      it('should allow esbuild for tsx', () => {
        expect(result.allowBuilds).toMatchObject({
          esbuild: true,
          prisma: true,
        });
      });
    });
  });

  describe('having the uwebsockets adapter', () => {
    describe('when called', () => {
      let result: ReturnType<typeof createPnpmWorkspaceSourceModel>;

      beforeAll(() => {
        result = createPnpmWorkspaceSourceModel(
          HttpAdapter.uwebsockets,
          ApiStyle.codeFirst,
        );
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
