import { beforeAll, describe, expect, it } from 'vitest';

import { StatusResponseSourceFixtures } from '../fixtures/StatusResponseSourceFixtures.js';
import { generateStatusResponseSource } from './generateStatusResponseSource.js';

describe(generateStatusResponseSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = StatusResponseSourceFixtures.any;
    });

    it('should generate a StatusResponse OpenAPI schema class', () => {
      expect(result).toContain(
        "import { OasSchema, OasSchemaProperty } from '@inversifyjs/http-open-api/v3Dot2';",
      );
      expect(result).toContain('export class StatusResponse');
      expect(result).toContain('@OasSchema(undefined, {');
      expect(result).toContain("name: 'StatusResponse'");
      expect(result).toContain('public status!: string;');
    });
  });
});
