import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { ClassMetadata } from '../models/ClassMetadata';
import { inject } from './inject';

describe(inject, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      class Foo {
        @inject('bar')
        public readonly bar!: string;

        @inject('baz')
        public readonly baz!: string;

        #someField!: string;

        constructor(
          @inject('firstParam')
          public firstParam: number,
          @inject('secondParam')
          public secondParam: number,
        ) {}

        public get someField(): string {
          return this.#someField;
        }

        @inject('someField')
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
            kind: ClassElementMetadataKind.singleInjection,
            name: undefined,
            optional: false,
            tags: new Map(),
            value: 'firstParam',
          },
          {
            kind: ClassElementMetadataKind.singleInjection,
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
              kind: ClassElementMetadataKind.singleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: 'bar',
            },
          ],
          [
            'baz',
            {
              kind: ClassElementMetadataKind.singleInjection,
              name: undefined,
              optional: false,
              tags: new Map(),
              value: 'baz',
            },
          ],
          [
            'someField',
            {
              kind: ClassElementMetadataKind.singleInjection,
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
