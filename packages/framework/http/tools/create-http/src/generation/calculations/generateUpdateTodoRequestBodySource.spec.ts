import { beforeAll, describe, expect, it } from 'vitest';

import { UpdateTodoRequestBodySourceFixtures } from '../fixtures/UpdateTodoRequestBodySourceFixtures.js';
import { generateUpdateTodoRequestBodySource } from './generateUpdateTodoRequestBodySource.js';

describe(generateUpdateTodoRequestBodySource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = UpdateTodoRequestBodySourceFixtures.any;
    });

    it('should generate an UpdateTodoRequestBody with optional fields', () => {
      expect(result).toContain(
        "import {\n  OasSchema,\n  OasSchemaOptionalProperty,\n} from '@inversifyjs/http-open-api/v3Dot2';",
      );
      expect(result).toContain("name: 'UpdateTodoRequestBody'");
      expect(result).toContain('export class UpdateTodoRequestBody');
      expect(result).toContain('@OasSchemaOptionalProperty');
      expect(result).toContain('public title?: string');
      expect(result).toContain('public description?: string');
      expect(result).toContain('public completed?: boolean');
    });
  });
});
