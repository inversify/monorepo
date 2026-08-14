import { beforeAll, describe, expect, it } from 'vitest';

import { StatusV1SourceFixtures } from '../fixtures/StatusV1SourceFixtures.js';
import { generateStatusV1Source } from './generateStatusV1Source.js';

describe(generateStatusV1Source, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = StatusV1SourceFixtures.any;
    });

    it('should generate a StatusV1 OpenAPI schema class', () => {
      expect(result).toContain(
        "import { OasSchema, OasSchemaProperty } from '@inversifyjs/http-open-api/v3Dot2';",
      );
      expect(result).toContain('export class StatusV1');
      expect(result).toContain('@OasSchema(undefined, {');
      expect(result).toContain("name: 'StatusV1'");
      expect(result).toContain('public status!: string;');
    });
  });
});
