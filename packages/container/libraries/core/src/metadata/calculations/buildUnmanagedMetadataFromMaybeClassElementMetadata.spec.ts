import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock(
  import('./buildClassElementMetadataFromMaybeClassElementMetadata.js'),
  () => ({
    buildClassElementMetadataFromMaybeClassElementMetadata: vitest
      .fn()
      .mockReturnValue(vitest.fn()),
  }),
);

import { type ClassElementMetadata } from '../models/ClassElementMetadata.js';
import { type MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata.js';
import { buildUnmanagedMetadataFromMaybeClassElementMetadata } from './buildUnmanagedMetadataFromMaybeClassElementMetadata.js';

describe(buildUnmanagedMetadataFromMaybeClassElementMetadata, () => {
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
