import { beforeAll, describe, expect, it } from '@jest/globals';

import 'reflect-metadata';

import { getReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { ClassMetadata } from '../models/ClassMetadata';
import { preDestroy } from './preDestroy';

describe(preDestroy.name, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      class Foo {
        @preDestroy()
        public initialize(): void {}
      }

      result = getReflectMetadata(Foo, classMetadataReflectKey);
    });

    it('should return expected metadata', () => {
      const expected: ClassMetadata = {
        constructorArguments: [],
        lifecycle: {
          postConstructMethodName: undefined,
          preDestroyMethodName: 'initialize',
        },
        properties: new Map(),
      };

      expect(result).toStrictEqual(expected);
    });
  });
});