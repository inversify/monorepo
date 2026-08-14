import { beforeAll, describe, expect, it } from 'vitest';

import { UpdateTodoV1RequestBodySourceFixtures } from '../fixtures/UpdateTodoV1RequestBodySourceFixtures.js';
import { generateUpdateTodoV1RequestBodySource } from './generateUpdateTodoV1RequestBodySource.js';

describe(generateUpdateTodoV1RequestBodySource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = UpdateTodoV1RequestBodySourceFixtures.any;
    });

    it('should generate an UpdateTodoV1RequestBody with optional fields', () => {
      expect(result).toContain(
        "import {\n  OasSchema,\n  OasSchemaOptionalProperty,\n} from '@inversifyjs/http-open-api/v3Dot2';",
      );
      expect(result).toContain("name: 'UpdateTodoV1RequestBody'");
      expect(result).toContain('export class UpdateTodoV1RequestBody');
      expect(result).toContain('@OasSchemaOptionalProperty');
      expect(result).toContain('public title?: string');
      expect(result).toContain('public description?: string');
      expect(result).toContain('public completed?: boolean');
    });
  });
});
