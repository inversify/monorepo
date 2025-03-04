import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

vitest.mock('./buildClassElementMetadataFromMaybeClassElementMetadata', () => ({
  buildClassElementMetadataFromMaybeClassElementMetadata: vitest
    .fn()
    .mockReturnValue(vitest.fn()),
}));

import { ClassElementMetadata } from '../models/ClassElementMetadata';
import { MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata';
import { buildUnmanagedMetadataFromMaybeClassElementMetadata } from './buildUnmanagedMetadataFromMaybeClassElementMetadata';

describe(buildUnmanagedMetadataFromMaybeClassElementMetadata.name, () => {
  describe('when called', () => {
    let buildClassMetadataMock: Mock<
      (metadata: MaybeClassElementMetadata | undefined) => ClassElementMetadata
    >;

    let result: unknown;

    beforeAll(() => {
      buildClassMetadataMock = vitest.fn();

      vitest
        .mocked(buildUnmanagedMetadataFromMaybeClassElementMetadata)
        .mockReturnValueOnce(buildClassMetadataMock);

      result = buildUnmanagedMetadataFromMaybeClassElementMetadata();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return expected function', () => {
      expect(result).toBe(buildClassMetadataMock);
    });
  });
});
