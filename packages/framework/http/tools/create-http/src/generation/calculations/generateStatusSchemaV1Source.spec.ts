import { beforeAll, describe, expect, it } from 'vitest';

import { generateStatusSchemaV1Source } from './generateStatusSchemaV1Source.js';

describe(generateStatusSchemaV1Source, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateStatusSchemaV1Source();
    });

    it('should generate a StatusV1 JSON schema object', () => {
      expect(result).toContain('export const statusSchemaV1');
      expect(result).toContain("type: 'object'");
      expect(result).toContain("type: 'string'");
      expect(result).toContain("required: ['status']");
    });
  });
});
