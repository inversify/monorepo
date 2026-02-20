import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey.js';
import { type ClassMetadata } from '../models/ClassMetadata.js';
import { postConstruct } from './postConstruct.js';

describe(postConstruct, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      class Foo {
        @postConstruct()
        public dispose(): void {}
      }

      result = getOwnReflectMetadata(Foo, classMetadataReflectKey);
    });

    it('should return expected metadata', () => {
      const expected: ClassMetadata = {
        constructorArguments: [],
        lifecycle: {
          postConstructMethodNames: new Set(['dispose']),
          preDestroyMethodNames: new Set(),
        },
        properties: new Map(),
        scope: undefined,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
