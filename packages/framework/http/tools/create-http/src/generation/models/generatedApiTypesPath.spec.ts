import { beforeAll, describe, expect, it } from 'vitest';

import { buildGeneratedApiSourceRelativePath } from './generatedApiTypesPath.js';

describe(buildGeneratedApiSourceRelativePath, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = buildGeneratedApiSourceRelativePath();
    });

    it('should return src/generated/api/index.ts', () => {
      expect(result).toBe('src/generated/api/index.ts');
    });
  });
});
