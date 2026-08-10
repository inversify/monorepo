import { beforeAll, describe, expect, it } from 'vitest';

import { TodoPersistencePortSourceFixtures } from '../fixtures/TodoPersistencePortSourceFixtures.js';
import { generateTodoPersistencePortSource } from './generateTodoPersistencePortSource.js';

describe(generateTodoPersistencePortSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = TodoPersistencePortSourceFixtures.any;
    });

    it('should generate a TodoPersistencePort with a create method', () => {
      expect(result).toContain(
        "import { type Todo } from '../../domain/models/Todo.js';",
      );
      expect(result).toContain('export interface CreateTodoData');
      expect(result).toContain('export interface TodoPersistencePort');
      expect(result).toContain('create(data: CreateTodoData): Promise<Todo>');
    });
  });
});
