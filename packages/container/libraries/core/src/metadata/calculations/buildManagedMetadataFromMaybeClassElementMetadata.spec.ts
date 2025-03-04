import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import { LazyServiceIdentifier, ServiceIdentifier } from '@inversifyjs/common';

vitest.mock('./buildClassElementMetadataFromMaybeClassElementMetadata', () => ({
  buildClassElementMetadataFromMaybeClassElementMetadata: vitest
    .fn()
    .mockReturnValue(vitest.fn()),
}));

import { ClassElementMetadata } from '../models/ClassElementMetadata';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata';
import { buildManagedMetadataFromMaybeClassElementMetadata } from './buildManagedMetadataFromMaybeClassElementMetadata';

describe(buildManagedMetadataFromMaybeClassElementMetadata.name, () => {
  let kindFixture:
    | ClassElementMetadataKind.multipleInjection
    | ClassElementMetadataKind.singleInjection;
  let serviceIdentifierFixture: ServiceIdentifier | LazyServiceIdentifier;

  beforeAll(() => {
    kindFixture = ClassElementMetadataKind.multipleInjection;
    serviceIdentifierFixture = 'service-id';
  });

  describe('when called', () => {
    let buildClassMetadataMock: Mock<
      (metadata: MaybeClassElementMetadata | undefined) => ClassElementMetadata
    >;

    let result: unknown;

    beforeAll(() => {
      buildClassMetadataMock = vitest.fn();

      vitest
        .mocked(buildManagedMetadataFromMaybeClassElementMetadata)
        .mockReturnValueOnce(buildClassMetadataMock);

      result = buildManagedMetadataFromMaybeClassElementMetadata(
        kindFixture,
        serviceIdentifierFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return expected function', () => {
      expect(result).toBe(buildClassMetadataMock);
    });
  });
});
