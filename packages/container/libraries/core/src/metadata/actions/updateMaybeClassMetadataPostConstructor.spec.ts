import { beforeAll, describe, expect, it } from 'vitest';

import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { MaybeClassMetadataFixtures } from '../fixtures/MaybeClassMetadataFixtures';
import { MaybeClassMetadata } from '../models/MaybeClassMetadata';
import { updateMaybeClassMetadataPostConstructor } from './updateMaybeClassMetadataPostConstructor';

describe(updateMaybeClassMetadataPostConstructor.name, () => {
  describe('having metadata with no postConstructorMethodName', () => {
    let metadataFixture: MaybeClassMetadata;
    let methodNameFixture: string | symbol;

    beforeAll(() => {
      metadataFixture = MaybeClassMetadataFixtures.any;
      methodNameFixture = Symbol();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result =
          updateMaybeClassMetadataPostConstructor(methodNameFixture)(
            metadataFixture,
          );
      });

      it('should return MaybeClassMetadata', () => {
        const expected: MaybeClassMetadata = {
          constructorArguments: [],
          lifecycle: {
            postConstructMethodName: methodNameFixture,
            preDestroyMethodName: undefined,
          },
          properties: new Map(),
          scope: undefined,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having metadata with postConstructorMethodName', () => {
    let metadataFixture: MaybeClassMetadata;
    let methodNameFixture: string | symbol;

    beforeAll(() => {
      metadataFixture = {
        constructorArguments: [],
        lifecycle: {
          postConstructMethodName: 'postConstructorMethodName',
          preDestroyMethodName: undefined,
        },
        properties: new Map(),
        scope: undefined,
      };
      methodNameFixture = Symbol();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          updateMaybeClassMetadataPostConstructor(methodNameFixture)(
            metadataFixture,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw InversifyCoreError', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.injectionDecoratorConflict,
          message: 'Unexpected duplicated postConstruct decorator',
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });
});
