import { beforeAll, describe, expect, it } from 'vitest';

import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { MaybeClassMetadataFixtures } from '../fixtures/MaybeClassMetadataFixtures';
import { MaybeClassMetadata } from '../models/MaybeClassMetadata';
import { updateMaybeClassMetadataPostConstructor } from './updateMaybeClassMetadataPostConstructor';

describe(updateMaybeClassMetadataPostConstructor, () => {
  describe('having metadata with no postConstructorMethodNames', () => {
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
            postConstructMethodNames: new Set([methodNameFixture]),
            preDestroyMethodNames: new Set(),
          },
          properties: new Map(),
          scope: undefined,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having metadata with existing postConstructorMethodNames', () => {
    let metadataFixture: MaybeClassMetadata;
    let methodNameFixture: string | symbol;
    let existingMethodNameFixture: string;

    beforeAll(() => {
      existingMethodNameFixture = 'existingMethod';
      metadataFixture = {
        constructorArguments: [],
        lifecycle: {
          postConstructMethodNames: new Set([existingMethodNameFixture]),
          preDestroyMethodNames: new Set(),
        },
        properties: new Map(),
        scope: undefined,
      };
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

      it('should return MaybeClassMetadata with both methods', () => {
        const expected: MaybeClassMetadata = {
          constructorArguments: [],
          lifecycle: {
            postConstructMethodNames: new Set([
              existingMethodNameFixture,
              methodNameFixture,
            ]),
            preDestroyMethodNames: new Set(),
          },
          properties: new Map(),
          scope: undefined,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having metadata with duplicate postConstructor method name', () => {
    let metadataFixture: MaybeClassMetadata;
    let methodNameFixture: string | symbol;

    beforeAll(() => {
      methodNameFixture = 'duplicateMethod';
      metadataFixture = {
        constructorArguments: [],
        lifecycle: {
          postConstructMethodNames: new Set([methodNameFixture]),
          preDestroyMethodNames: new Set(),
        },
        properties: new Map(),
        scope: undefined,
      };
    });

    describe('when called', () => {
      it('should throw an InversifyCoreError', () => {
        expect(() => {
          updateMaybeClassMetadataPostConstructor(methodNameFixture)(
            metadataFixture,
          );
        }).toThrow(
          new InversifyCoreError(
            InversifyCoreErrorKind.injectionDecoratorConflict,
            `Unexpected duplicated postConstruct method ${methodNameFixture.toString()}`,
          ),
        );
      });
    });
  });
});
