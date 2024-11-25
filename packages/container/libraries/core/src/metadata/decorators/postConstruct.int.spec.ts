import { beforeAll, describe, expect, it } from '@jest/globals';

import 'reflect-metadata';

import { getReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { ClassMetadata } from '../models/ClassMetadata';
import { postConstruct } from './postConstruct';

describe(postConstruct.name, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      class Foo {
        @postConstruct()
        public dispose(): void {}
      }

      result = getReflectMetadata(Foo, classMetadataReflectKey);
    });

    it('should return expected metadata', () => {
      const expected: ClassMetadata = {
        constructorArguments: [],
        lifecycle: {
          postConstructMethodName: 'dispose',
          preDestroyMethodName: undefined,
        },
        properties: new Map(),
      };

      expect(result).toStrictEqual(expected);
    });
  });
});