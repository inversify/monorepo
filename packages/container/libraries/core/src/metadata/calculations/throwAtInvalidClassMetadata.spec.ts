import { beforeAll, describe, expect, it } from 'vitest';

import { Newable } from '@inversifyjs/common';

import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { ClassMetadataFixtures } from '../fixtures/ClassMetadataFixtures';
import { ClassMetadata } from '../models/ClassMetadata';
import { MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata';
import { MaybeClassElementMetadataKind } from '../models/MaybeClassElementMetadataKind';
import { MaybeClassMetadata } from '../models/MaybeClassMetadata';
import { throwAtInvalidClassMetadata } from './throwAtInvalidClassMetadata';

describe(throwAtInvalidClassMetadata, () => {
  describe('having valid class metadata', () => {
    let typefixture: Newable;
    let classMetadataFixure: ClassMetadata;

    beforeAll(() => {
      typefixture = class Foo {};
      classMetadataFixure = ClassMetadataFixtures.any;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          throwAtInvalidClassMetadata(typefixture, classMetadataFixure);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.unknown,
          message: `Unexpected class metadata for type "${typefixture.name}" with uncompletion traces.
This might be caused by one of the following reasons:

1. A third party library is targeting inversify reflection metadata.
2. A bug is causing the issue. Consider submiting an issue to fix it.`,
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });

  describe('having invalid class metadata with both undefined and invalid constructor metadata and invalid property metadata', () => {
    let typeFixture: Newable;
    let classMetadataFixure: MaybeClassMetadata;
    let emptyConstructorIndex: number;
    let invalidConstructorIndex: number;
    let invalidPropertyName: string | symbol;

    beforeAll(() => {
      typeFixture = class Foo {};

      invalidConstructorIndex = 0;
      emptyConstructorIndex = 1;
      invalidPropertyName = 'foo';

      const constructorClassMetadata: MaybeClassElementMetadata[] = [];

      const maybeClassElementMetadata: MaybeClassElementMetadata = {
        kind: MaybeClassElementMetadataKind.unknown,
        name: undefined,
        optional: false,
        tags: new Map(),
      };

      constructorClassMetadata[invalidConstructorIndex] =
        maybeClassElementMetadata;

      constructorClassMetadata[emptyConstructorIndex] =
        undefined as unknown as MaybeClassElementMetadata;

      classMetadataFixure = {
        constructorArguments: constructorClassMetadata,
        lifecycle: {
          postConstructMethodNames: new Set(),
          preDestroyMethodNames: new Set(),
        },
        properties: new Map([[invalidPropertyName, maybeClassElementMetadata]]),
        scope: undefined,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          throwAtInvalidClassMetadata(typeFixture, classMetadataFixure);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.missingInjectionDecorator,
          message: `Invalid class metadata at type ${typeFixture.name}:

  - Missing or incomplete metadata for type "${typeFixture.name}" at constructor argument with index ${invalidConstructorIndex.toString()}.
Every constructor parameter must be decorated either with @inject, @multiInject or @unmanaged decorator.

  - Missing or incomplete metadata for type "${typeFixture.name}" at constructor argument with index ${emptyConstructorIndex.toString()}.
Every constructor parameter must be decorated either with @inject, @multiInject or @unmanaged decorator.

  - Missing or incomplete metadata for type "${typeFixture.name}" at property "${invalidPropertyName.toString()}".
This property must be decorated either with @inject or @multiInject decorator.`,
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });
});
