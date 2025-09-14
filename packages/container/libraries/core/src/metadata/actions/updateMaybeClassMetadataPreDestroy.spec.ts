import { beforeAll, describe, expect, it } from 'vitest';

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
          postConstructMethodNames: [],
          preDestroyMethodNames: [],
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
            postConstructMethodNames: [],
            preDestroyMethodNames: [methodNameFixture],
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
          postConstructMethodNames: [],
          preDestroyMethodNames: [existingMethodNameFixture],
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
            postConstructMethodNames: [],
            preDestroyMethodNames: [
              existingMethodNameFixture,
              methodNameFixture,
            ],
          },
          properties: new Map(),
          scope: undefined,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
