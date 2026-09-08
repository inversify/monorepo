import { beforeAll, describe, expect, it } from 'vitest';

import { generateCreateTodoV1RequestBodySchemaSource } from './generateCreateTodoV1RequestBodySchemaSource.js';

describe(generateCreateTodoV1RequestBodySchemaSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateCreateTodoV1RequestBodySchemaSource();
    });

    it('should generate a create-todo request JSON schema', () => {
      expect(result).toContain('export const createTodoV1RequestBodySchema');
      expect(result).toContain("required: ['description', 'title']");
    });
  });
});
