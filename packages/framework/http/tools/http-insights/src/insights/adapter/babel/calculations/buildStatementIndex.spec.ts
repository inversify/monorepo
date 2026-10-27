import { beforeAll, describe, expect, it } from 'vitest';

import { buildStatementIndex } from './buildStatementIndex.js';

describe(buildStatementIndex, () => {
  describe('having source that is not valid JavaScript', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildStatementIndex('const =', 'handler.js');
      });

      it('should return null', () => {
        expect(result).toBeNull();
      });
    });
  });
});
