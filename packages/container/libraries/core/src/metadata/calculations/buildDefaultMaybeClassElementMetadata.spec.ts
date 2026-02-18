import { beforeAll, describe, expect, it } from 'vitest';

import { MaybeClassElementMetadataKind } from '../models/MaybeClassElementMetadataKind.js';
import { type MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata.js';
import { buildDefaultMaybeClassElementMetadata } from './buildDefaultMaybeClassElementMetadata.js';

describe(buildDefaultMaybeClassElementMetadata, () => {
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
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
