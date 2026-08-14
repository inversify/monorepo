import { beforeAll, describe, expect, it } from 'vitest';

import { CreateTodoV1RequestBodySourceFixtures } from '../fixtures/CreateTodoV1RequestBodySourceFixtures.js';
import { generateCreateTodoV1RequestBodySource } from './generateCreateTodoV1RequestBodySource.js';

describe(generateCreateTodoV1RequestBodySource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = CreateTodoV1RequestBodySourceFixtures.any;
    });

    it('should generate a CreateTodoV1RequestBody with title and description', () => {
      expect(result).toContain(
        "import { OasSchema, OasSchemaProperty } from '@inversifyjs/http-open-api/v3Dot2';",
      );
      expect(result).toContain("name: 'CreateTodoV1RequestBody'");
      expect(result).toContain('export class CreateTodoV1RequestBody');
      expect(result).toContain('public title!: string;');
      expect(result).toContain('public description!: string;');
    });
  });
});
