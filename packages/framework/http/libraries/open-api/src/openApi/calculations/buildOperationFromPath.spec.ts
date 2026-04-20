import { beforeAll, describe, expect, it } from 'vitest';

import { tryBuildOperationFromPath } from './buildOperationFromPath.js';

describe(tryBuildOperationFromPath, () => {
  describe('having a path with no params and no wildcard', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = tryBuildOperationFromPath('/users');
      });

      it('should return the path as-is', () => {
        expect(result).toBe('/users');
      });
    });
  });

  describe('having a path with a single param', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = tryBuildOperationFromPath('/users/:userId');
      });

      it('should replace the param with OpenAPI curly-brace syntax', () => {
        expect(result).toBe('/users/{userId}');
      });
    });
  });

  describe('having a path with multiple params', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = tryBuildOperationFromPath('/users/:userId/posts/:postId');
      });

      it('should replace all params with OpenAPI curly-brace syntax', () => {
        expect(result).toBe('/users/{userId}/posts/{postId}');
      });
    });
  });

  describe('having a path with a wildcard', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = tryBuildOperationFromPath('/files/*');
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a root path', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = tryBuildOperationFromPath('/');
      });

      it('should return the path as-is', () => {
        expect(result).toBe('/');
      });
    });
  });
});
