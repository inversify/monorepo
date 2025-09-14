import { beforeAll, describe, expect, it } from 'vitest';

import { ClassMetadata } from '../models/ClassMetadata';
import { getDefaultClassMetadata } from './getDefaultClassMetadata';

describe(getDefaultClassMetadata, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = getDefaultClassMetadata();
    });

    it('should return ClassMetadata', () => {
      const expected: ClassMetadata = {
        constructorArguments: [],
        lifecycle: {
          postConstructMethodNames: new Set(),
          preDestroyMethodNames: new Set(),
        },
        properties: new Map(),
        scope: undefined,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
