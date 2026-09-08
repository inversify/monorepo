import { beforeAll, describe, expect, it } from 'vitest';

import { generateInitialApiTypesSource } from './generateInitialApiTypesSource.js';

describe(generateInitialApiTypesSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateInitialApiTypesSource();
    });

    it('should stub named generated types as any', () => {
      expect(result).toContain('export type StatusV1 = any;');
      expect(result).toContain('export type TodoV1 = any;');
      expect(result).toContain('export type CreateTodoV1RequestBody = any;');
      expect(result).toContain('export type PaginatedTodosV1Response = any;');
      expect(result).toContain('export type UpdateTodoV1RequestBody = any;');
      expect(result).toContain('export type Root = any;');
    });
  });
});
