import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { MaybeClassElementMetadataKind } from '../models/MaybeClassElementMetadataKind';
import { MaybeClassMetadata } from '../models/MaybeClassMetadata';
import { optional } from './optional';

describe(optional, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      class Foo {
        @optional()
        public readonly bar!: string;

        @optional()
        public readonly baz!: string;

        #someField!: string;

        constructor(
          @optional()
          public firstParam: number,
          @optional()
          public secondParam: number,
        ) {}

        public get someField(): string {
          return this.#someField;
        }

        @optional()
        public set someField(value: string) {
          this.#someField = value;
        }
      }

      result = getOwnReflectMetadata(Foo, classMetadataReflectKey);
    });

    it('should return expected metadata', () => {
      const expected: MaybeClassMetadata = {
        constructorArguments: [
          {
            kind: MaybeClassElementMetadataKind.unknown,
            name: undefined,
            optional: true,
            tags: new Map(),
          },
          {
            kind: MaybeClassElementMetadataKind.unknown,
            name: undefined,
            optional: true,
            tags: new Map(),
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
              kind: MaybeClassElementMetadataKind.unknown,
              name: undefined,
              optional: true,
              tags: new Map(),
            },
          ],
          [
            'baz',
            {
              kind: MaybeClassElementMetadataKind.unknown,
              name: undefined,
              optional: true,
              tags: new Map(),
            },
          ],
          [
            'someField',
            {
              kind: MaybeClassElementMetadataKind.unknown,
              name: undefined,
              optional: true,
              tags: new Map(),
            },
          ],
        ]),
        scope: undefined,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
