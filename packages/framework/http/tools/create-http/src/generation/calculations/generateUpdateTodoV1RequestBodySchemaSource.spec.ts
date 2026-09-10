import { beforeAll, describe, expect, it } from 'vitest';

import { generateUpdateTodoV1RequestBodySchemaSource } from './generateUpdateTodoV1RequestBodySchemaSource.js';

describe(generateUpdateTodoV1RequestBodySchemaSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateUpdateTodoV1RequestBodySchemaSource();
    });

    it('should generate an update-todo request JSON schema without required fields', () => {
      expect(result).toContain(
        'export const updateTodoV1RequestBodySchema: OpenApi3Dot2SchemaObject',
      );
      expect(result).toContain('completed');
      expect(result).not.toContain('required:');
    });
  });
});
