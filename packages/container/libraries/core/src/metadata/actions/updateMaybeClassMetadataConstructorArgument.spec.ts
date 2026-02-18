import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import { MaybeClassMetadataFixtures } from '../fixtures/MaybeClassMetadataFixtures.js';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';
import { type ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata.js';
import { type MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata.js';
import { type MaybeClassMetadata } from '../models/MaybeClassMetadata.js';
import { updateMaybeClassMetadataConstructorArgument } from './updateMaybeClassMetadataConstructorArgument.js';

describe(updateMaybeClassMetadataConstructorArgument, () => {
  let updateMetadataMock: Mock<
    (
      classMetadata: MaybeClassElementMetadata | undefined,
    ) => MaybeClassElementMetadata
  >;
  let classMetadataFixture: MaybeClassMetadata;
  let originalClassMetadataFixture: MaybeClassMetadata;
  let indexFixture: number;

  beforeAll(() => {
    updateMetadataMock = vitest.fn();

    classMetadataFixture = MaybeClassMetadataFixtures.any;

    originalClassMetadataFixture = MaybeClassMetadataFixtures.any;

    indexFixture = 0;
  });

  describe('when called', () => {
    let classElementMetadataFixture: ManagedClassElementMetadata;

    let result: unknown;

    beforeAll(() => {
      classElementMetadataFixture = {
        kind: ClassElementMetadataKind.singleInjection,
        name: undefined,
        optional: false,
        tags: new Map(),
        value: Symbol(),
      };

      updateMetadataMock.mockReturnValueOnce(classElementMetadataFixture);

      result = updateMaybeClassMetadataConstructorArgument(
        updateMetadataMock,
        indexFixture,
      )(classMetadataFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call updateMetadata()', () => {
      expect(updateMetadataMock).toHaveBeenCalledExactlyOnceWith(undefined);
    });

    it('should return MaybeClassMetadata', () => {
      const expected: MaybeClassMetadata = {
        ...originalClassMetadataFixture,
        constructorArguments: [classElementMetadataFixture],
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
