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
import { updateMaybeClassMetadataProperty } from './updateMaybeClassMetadataProperty';

describe(updateMaybeClassMetadataProperty, () => {
  let updateMetadataMock: Mock<
    (
      classMetadata: MaybeClassElementMetadata | undefined,
    ) => MaybeClassElementMetadata
  >;
  let classMetadataFixture: MaybeClassMetadata;
  let originalClassMetadataFixture: MaybeClassMetadata;
  let propertyKeyFixture: string;

  beforeAll(() => {
    updateMetadataMock = vitest.fn();

    classMetadataFixture = MaybeClassMetadataFixtures.any;

    originalClassMetadataFixture = MaybeClassMetadataFixtures.any;

    propertyKeyFixture = 'property-key-fixture';
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

      result = updateMaybeClassMetadataProperty(
        updateMetadataMock,
        propertyKeyFixture,
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
        properties: new Map([
          [propertyKeyFixture, classElementMetadataFixture],
        ]),
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
