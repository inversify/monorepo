import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { ClassMetadata } from '../models/ClassMetadata';
import { unmanaged } from './unmanaged';

describe(unmanaged, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      class Foo {
        @unmanaged()
        public readonly bar!: string;

        @unmanaged()
        public readonly baz!: string;

        #someField!: string;

        constructor(
          @unmanaged()
          public firstParam: number,
          @unmanaged()
          public secondParam: number,
        ) {}

        public get someField(): string {
          return this.#someField;
        }

        @unmanaged()
        public set someField(value: string) {
          this.#someField = value;
        }
      }

      result = getOwnReflectMetadata(Foo, classMetadataReflectKey);
    });

    it('should return expected metadata', () => {
      const expected: ClassMetadata = {
        constructorArguments: [
          {
            kind: ClassElementMetadataKind.unmanaged,
          },
          {
            kind: ClassElementMetadataKind.unmanaged,
          },
        ],
        lifecycle: {
          postConstructMethodNames: new Set(),
          preDestroyMethodNames: new Set(),
        },
        properties: new Map([
          [
            'bar',
            {
              kind: ClassElementMetadataKind.unmanaged,
            },
          ],
          [
            'baz',
            {
              kind: ClassElementMetadataKind.unmanaged,
            },
          ],
          [
            'someField',
            {
              kind: ClassElementMetadataKind.unmanaged,
            },
          ],
        ]),
        scope: undefined,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
