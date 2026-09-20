import { beforeAll, describe, expect, it } from 'vitest';

import { TodoPersistencePortSourceFixtures } from '../fixtures/TodoPersistencePortSourceFixtures.js';
import { generateTodoPersistencePortSource } from './generateTodoPersistencePortSource.js';

describe(generateTodoPersistencePortSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = TodoPersistencePortSourceFixtures.any;
    });

    it('should generate a TodoPersistencePort with create, find, update, and delete methods', () => {
      expect(result).toContain(
        "import { type Todo } from '../../domain/models/Todo.js';",
      );
      expect(result).toContain('export interface CreateTodoData');
      expect(result).toContain('export interface FindTodoQuery');
      expect(result).toContain(
        'export interface FindTodosQuery extends FindTodoQuery',
      );
      expect(result).toContain('export interface FindTodosResult');
      expect(result).toContain('export interface UpdateTodoData');
      expect(result).toContain('export interface TodoPersistencePort');
      expect(result).toContain('create(data: CreateTodoData): Promise<Todo>');
      expect(result).toContain(
        'delete(query: FindTodoQuery): Promise<Todo | undefined>',
      );
      expect(result).toContain(
        'findOne(query: FindTodoQuery): Promise<Todo | undefined>',
      );
      expect(result).not.toContain('findById');
      expect(result).toContain(
        'findMany(query: FindTodosQuery): Promise<FindTodosResult>',
      );
      expect(result).toContain(
        'update(query: FindTodoQuery, data: UpdateTodoData): Promise<Todo | undefined>',
      );
    });
  });
});
