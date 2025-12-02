import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { ClassMetadata } from '../models/ClassMetadata';
import { preDestroy } from './preDestroy';

describe(preDestroy, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      class Foo {
        @preDestroy()
        public initialize(): void {}
      }

      result = getOwnReflectMetadata(Foo, classMetadataReflectKey);
    });

    it('should return expected metadata', () => {
      const expected: ClassMetadata = {
        constructorArguments: [],
        lifecycle: {
          postConstructMethodNames: new Set(),
          preDestroyMethodNames: new Set(['initialize']),
        },
        properties: new Map(),
        scope: undefined,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
