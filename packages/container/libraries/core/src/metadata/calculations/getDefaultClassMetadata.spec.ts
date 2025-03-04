import { beforeAll, describe, expect, it } from 'vitest';

import { ClassMetadata } from '../models/ClassMetadata';
import { getDefaultClassMetadata } from './getDefaultClassMetadata';

describe(getDefaultClassMetadata.name, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = getDefaultClassMetadata();
    });

    it('should return ClassMetadata', () => {
      const expected: ClassMetadata = {
        constructorArguments: [],
        lifecycle: {
          postConstructMethodName: undefined,
          preDestroyMethodName: undefined,
        },
        properties: new Map(),
        scope: undefined,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
