import { beforeAll, describe, expect, it } from '@jest/globals';

import { MaybeClassElementMetadataKind } from '../models/MaybeClassElementMetadataKind';
import { MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata';
import { buildDefaultMaybeClassElementMetadata } from './buildDefaultMaybeClassElementMetadata';

describe(buildDefaultMaybeClassElementMetadata.name, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = buildDefaultMaybeClassElementMetadata();
    });

    it('should return MaybeManagedClassElementMetadata', () => {
      const expected: MaybeManagedClassElementMetadata = {
        kind: MaybeClassElementMetadataKind.unknown,
        name: undefined,
        optional: false,
        tags: new Map(),
        targetName: undefined,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});