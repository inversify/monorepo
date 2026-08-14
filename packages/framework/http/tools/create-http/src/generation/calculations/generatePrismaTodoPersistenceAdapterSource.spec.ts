import { beforeAll, describe, expect, it } from 'vitest';

import { PrismaTodoPersistenceAdapterSourceFixtures } from '../fixtures/PrismaTodoPersistenceAdapterSourceFixtures.js';
import { generatePrismaTodoPersistenceAdapterSource } from './generatePrismaTodoPersistenceAdapterSource.js';

describe(generatePrismaTodoPersistenceAdapterSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = PrismaTodoPersistenceAdapterSourceFixtures.any;
    });

    it('should generate a Prisma adapter that implements TodoPersistencePort', () => {
      expect(result).toContain(
        "import {\n  Prisma,\n  PrismaClient,\n  type Todo as PrismaTodo,\n} from '../../../../generated/prisma/client.js';",
      );
      expect(result).toContain(
        "import { TodoFromPrismaTodoBuilder } from '../builders/TodoFromPrismaTodoBuilder.js';",
      );
      expect(result).toContain(
        'export class PrismaTodoPersistenceAdapter implements TodoPersistencePort',
      );
      expect(result).toContain('@inject(PrismaClient)');
      expect(result).toContain('@inject(TodoFromPrismaTodoBuilder)');
      expect(result).toContain('this.#prismaClient.todo.create');
      expect(result).toContain('this.#prismaClient.todo.findFirst');
      expect(result).toContain('this.#prismaClient.todo.findMany');
      expect(result).toContain('this.#prismaClient.todo.count');
      expect(result).toContain('this.#prismaClient.todo.update');
      expect(result).toContain('deleted_at: new Date()');
      expect(result).toContain('deleted_at: null,\n          id,');
      expect(result).toContain("error.code === 'P2025'");
      expect(result).toContain('public async delete(id: string)');
      expect(result).toContain('public async findById(id: string)');
      expect(result).toContain('public async findMany(query: FindTodosQuery)');
      expect(result).toContain('public async update(');
      expect(result).toContain(
        "if (('title' satisfies keyof UpdateTodoData) in data)",
      );
      expect(result).toContain(
        "if (('description' satisfies keyof UpdateTodoData) in data)",
      );
      expect(result).toContain(
        "if (('completed' satisfies keyof UpdateTodoData) in data)",
      );
      expect(result).toContain(
        'this.#todoFromPrismaTodoBuilder.build(prismaTodo)',
      );
      expect(result).not.toContain('#mapTodo');
      expect(result).not.toContain('existingTodo');
    });
  });
});
