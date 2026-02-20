import { beforeAll, describe, expect, it } from 'vitest';

import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';
import { type UnmanagedClassElementMetadata } from '../models/UnmanagedClassElementMetadata.js';
import { buildDefaultUnmanagedMetadata } from './buildDefaultUnmanagedMetadata.js';

describe(buildDefaultUnmanagedMetadata, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = buildDefaultUnmanagedMetadata();
    });

    it('should return UnmanagedClassElementMetadata', () => {
      const expected: UnmanagedClassElementMetadata = {
        kind: ClassElementMetadataKind.unmanaged,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
