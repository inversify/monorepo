import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { ClassMetadata } from '../models/ClassMetadata';
import { multiInject } from './multiInject';

describe(multiInject, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      class Foo {
        @multiInject('bar')
        public readonly bar!: string;

        @multiInject('baz')
        public readonly baz!: string;

        #someField!: string;

        constructor(
          @multiInject('firstParam')
          public firstParam: number,
          @multiInject('secondParam')
          public secondParam: number,
        ) {}

        public get someField(): string {
          return this.#someField;
        }

        @multiInject('someField')
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
            chained: false,
            kind: ClassElementMetadataKind.multipleInjection,
            name: undefined,
            optional: false,
            tags: new Map(),
            value: 'firstParam',
          },
          {
            chained: false,
            kind: ClassElementMetadataKind.multipleInjection,
            name: undefined,
            optional: false,
            tags: new Map(),
            value: 'secondParam',
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
              chained: false,
              kind: ClassElementMetadataKind.multipleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: 'bar',
            },
          ],
          [
            'baz',
            {
              chained: false,
              kind: ClassElementMetadataKind.multipleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: 'baz',
            },
          ],
          [
            'someField',
            {
              chained: false,
              kind: ClassElementMetadataKind.multipleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: 'someField',
            },
          ],
        ]),
        scope: undefined,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
