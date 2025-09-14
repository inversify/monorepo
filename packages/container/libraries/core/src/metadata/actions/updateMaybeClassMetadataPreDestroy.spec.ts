import { beforeAll, describe, expect, it } from 'vitest';

import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { MaybeClassMetadata } from '../models/MaybeClassMetadata';
import { updateMaybeClassMetadataPreDestroy } from './updateMaybeClassMetadataPreDestroy';

describe(updateMaybeClassMetadataPreDestroy, () => {
  describe('having metadata with no preDestroyMethodNames', () => {
    let metadataFixture: MaybeClassMetadata;
    let methodNameFixture: string | symbol;

    beforeAll(() => {
      metadataFixture = {
        constructorArguments: [],
        lifecycle: {
          postConstructMethodNames: new Set(),
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
          updateMaybeClassMetadataPreDestroy(methodNameFixture)(
            metadataFixture,
          );
      });

      it('should return MaybeClassMetadata', () => {
        const expected: MaybeClassMetadata = {
          constructorArguments: [],
          lifecycle: {
            postConstructMethodNames: new Set(),
            preDestroyMethodNames: new Set([methodNameFixture]),
          },
          properties: new Map(),
          scope: undefined,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having metadata with existing preDestroyMethodNames', () => {
    let metadataFixture: MaybeClassMetadata;
    let methodNameFixture: string | symbol;
    let existingMethodNameFixture: string;

    beforeAll(() => {
      existingMethodNameFixture = 'existingMethod';
      metadataFixture = {
        constructorArguments: [],
        lifecycle: {
          postConstructMethodNames: new Set(),
          preDestroyMethodNames: new Set([existingMethodNameFixture]),
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
          updateMaybeClassMetadataPreDestroy(methodNameFixture)(
            metadataFixture,
          );
      });

      it('should return MaybeClassMetadata with both methods', () => {
        const expected: MaybeClassMetadata = {
          constructorArguments: [],
          lifecycle: {
            postConstructMethodNames: new Set(),
            preDestroyMethodNames: new Set([
              existingMethodNameFixture,
              methodNameFixture,
            ]),
          },
          properties: new Map(),
          scope: undefined,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having metadata with duplicate preDestroy method name', () => {
    let metadataFixture: MaybeClassMetadata;
    let methodNameFixture: string | symbol;

    beforeAll(() => {
      methodNameFixture = 'duplicateMethod';
      metadataFixture = {
        constructorArguments: [],
        lifecycle: {
          postConstructMethodNames: new Set(),
          preDestroyMethodNames: new Set([methodNameFixture]),
        },
        properties: new Map(),
        scope: undefined,
      };
    });

    describe('when called', () => {
      it('should throw an InversifyCoreError', () => {
        expect(() => {
          updateMaybeClassMetadataPreDestroy(methodNameFixture)(
            metadataFixture,
          );
        }).toThrow(
          new InversifyCoreError(
            InversifyCoreErrorKind.injectionDecoratorConflict,
            `Unexpected duplicated preDestroy method ${methodNameFixture.toString()}`,
          ),
        );
      });
    });
  });
});
