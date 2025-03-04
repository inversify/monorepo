import { beforeAll, describe, expect, it } from 'vitest';

import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { UnmanagedClassElementMetadata } from '../models/UnmanagedClassElementMetadata';
import { buildDefaultUnmanagedMetadata } from './buildDefaultUnmanagedMetadata';

describe(buildDefaultUnmanagedMetadata.name, () => {
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
