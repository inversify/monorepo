import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { MaybeClassElementMetadataKind } from '../models/MaybeClassElementMetadataKind';
import { MaybeClassMetadata } from '../models/MaybeClassMetadata';
import { named } from './named';

describe(named, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      class Foo {
        @named('bar')
        public readonly bar!: string;

        @named('baz')
        public readonly baz!: string;

        #someField!: string;

        constructor(
          @named('firstParam')
          public firstParam: number,
          @named('secondParam')
          public secondParam: number,
        ) {}

        public get someField(): string {
          return this.#someField;
        }

        @named('someField')
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
            name: 'firstParam',
            optional: false,
            tags: new Map(),
          },
          {
            kind: MaybeClassElementMetadataKind.unknown,
            name: 'secondParam',
            optional: false,
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
              name: 'bar',
              optional: false,
              tags: new Map(),
            },
          ],
          [
            'baz',
            {
              kind: MaybeClassElementMetadataKind.unknown,
              name: 'baz',
              optional: false,
              tags: new Map(),
            },
          ],
          [
            'someField',
            {
              kind: MaybeClassElementMetadataKind.unknown,
              name: 'someField',
              optional: false,
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
