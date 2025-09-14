import { beforeAll, describe, expect, it } from 'vitest';

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
            postConstructMethodNames: [methodNameFixture],
            preDestroyMethodNames: [],
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
          postConstructMethodNames: [existingMethodNameFixture],
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
          updateMaybeClassMetadataPostConstructor(methodNameFixture)(
            metadataFixture,
          );
      });

      it('should return MaybeClassMetadata with both methods', () => {
        const expected: MaybeClassMetadata = {
          constructorArguments: [],
          lifecycle: {
            postConstructMethodNames: [
              existingMethodNameFixture,
              methodNameFixture,
            ],
            preDestroyMethodNames: [],
          },
          properties: new Map(),
          scope: undefined,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
