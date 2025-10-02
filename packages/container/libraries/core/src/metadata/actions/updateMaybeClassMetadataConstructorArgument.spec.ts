import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import { MaybeClassMetadataFixtures } from '../fixtures/MaybeClassMetadataFixtures';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata';
import { MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata';
import { MaybeClassMetadata } from '../models/MaybeClassMetadata';
import { updateMaybeClassMetadataConstructorArgument } from './updateMaybeClassMetadataConstructorArgument';

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
