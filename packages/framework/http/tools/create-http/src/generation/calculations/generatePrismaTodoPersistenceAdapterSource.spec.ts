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
      expect(result).toContain('const createData: Prisma.TodoCreateInput');
      expect(result).toContain('const deleteData: Prisma.TodoUpdateInput');
      expect(result).toContain('const updateData: Prisma.TodoUpdateInput');
      expect(result).toContain('const where: Prisma.TodoWhereInput');
      expect(result).toContain('deleted_at: new Date()');
      expect(result).toContain('where.deleted_at = query.deletedAt');
      expect(result).not.toContain('deleted_at: null');
      expect(result).toContain("error.code === 'P2025'");
      expect(result).toContain('public async delete(query: FindTodoQuery)');
      expect(result).toContain('public async findOne(query: FindTodoQuery)');
      expect(result).not.toContain('findById');
      expect(result).toContain('public async findMany(query: FindTodosQuery)');
      expect(result).toContain('public async update(');
      expect(result).toContain(
        "('title' satisfies keyof UpdateTodoData) in data && data.title !== undefined",
      );
      expect(result).toContain(
        "('description' satisfies keyof UpdateTodoData) in data &&\n      data.description !== undefined",
      );
      expect(result).toContain(
        "('completed' satisfies keyof UpdateTodoData) in data &&\n      data.completed !== undefined",
      );
      expect(result).toContain(
        'this.#todoFromPrismaTodoBuilder.build(prismaTodo)',
      );
      expect(result).not.toContain('#mapTodo');
    });
  });
});
