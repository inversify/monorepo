import { beforeAll, describe, expect, it } from '@jest/globals';

import 'reflect-metadata';

import { getReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { MaybeClassElementMetadataKind } from '../models/MaybeClassElementMetadataKind';
import { MaybeClassMetadata } from '../models/MaybeClassMetadata';
import { optional } from './optional';

describe(optional.name, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      class Foo {
        @optional()
        public readonly bar!: string;

        @optional()
        public readonly baz!: string;

        constructor(
          @optional()
          public firstParam: number,
          @optional()
          public secondParam: number,
        ) {}
      }

      result = getReflectMetadata(Foo, classMetadataReflectKey);
    });

    it('should return expected metadata', () => {
      const expected: MaybeClassMetadata = {
        constructorArguments: [
          {
            kind: MaybeClassElementMetadataKind.unknown,
            name: undefined,
            optional: true,
            tags: new Map(),
            targetName: undefined,
          },
          {
            kind: MaybeClassElementMetadataKind.unknown,
            name: undefined,
            optional: true,
            tags: new Map(),
            targetName: undefined,
          },
        ],
        lifecycle: {
          postConstructMethodName: undefined,
          preDestroyMethodName: undefined,
        },
        properties: new Map([
          [
            'bar',
            {
              kind: MaybeClassElementMetadataKind.unknown,
              name: undefined,
              optional: true,
              tags: new Map(),
              targetName: undefined,
            },
          ],
          [
            'baz',
            {
              kind: MaybeClassElementMetadataKind.unknown,
              name: undefined,
              optional: true,
              tags: new Map(),
              targetName: undefined,
            },
          ],
        ]),
        scope: undefined,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
