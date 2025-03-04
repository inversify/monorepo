import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata';

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { ClassMetadata } from '../models/ClassMetadata';
import { multiInject } from './multiInject';

describe(multiInject.name, () => {
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
            kind: ClassElementMetadataKind.multipleInjection,
            name: undefined,
            optional: false,
            tags: new Map(),
            value: 'firstParam',
          },
          {
            kind: ClassElementMetadataKind.multipleInjection,
            name: undefined,
            optional: false,
            tags: new Map(),
            value: 'secondParam',
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
