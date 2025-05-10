import { beforeAll, describe, expect, it } from 'vitest';

import { buildDefaultArrayMetadata } from './buildDefaultArrayMetadata';

describe(buildDefaultArrayMetadata.name, () => {
  describe('when called', () => {
    let result: unknown[];

    beforeAll(() => {
      result = buildDefaultArrayMetadata();
    });

    it('should return an empty array', () => {
      expect(result).toStrictEqual([]);
    });
  });
});
