export function generatePrismaTodoPersistenceAdapterSource(): string {
  return `import { inject, injectable } from 'inversify';

import {
  Prisma,
  PrismaClient,
  type Todo as PrismaTodo,
} from '../../../../generated/prisma/client.js';
import {
  type CreateTodoData,
  type FindTodoQuery,
  type FindTodosQuery,
  type FindTodosResult,
  type TodoPersistencePort,
  type UpdateTodoData,
} from '../../../application/ports/TodoPersistencePort.js';
import { type Todo } from '../../../domain/models/Todo.js';
import { TodoFromPrismaTodoBuilder } from '../builders/TodoFromPrismaTodoBuilder.js';

@injectable()
export class PrismaTodoPersistenceAdapter implements TodoPersistencePort {
  readonly #prismaClient: PrismaClient;
  readonly #todoFromPrismaTodoBuilder: TodoFromPrismaTodoBuilder;

  constructor(
    @inject(PrismaClient) prismaClient: PrismaClient,
    @inject(TodoFromPrismaTodoBuilder)
    todoFromPrismaTodoBuilder: TodoFromPrismaTodoBuilder,
  ) {
    this.#prismaClient = prismaClient;
    this.#todoFromPrismaTodoBuilder = todoFromPrismaTodoBuilder;
  }

  public async create(data: CreateTodoData): Promise<Todo> {
    const createData: Prisma.TodoCreateInput = {
      description: data.description,
      title: data.title,
    };

    const prismaTodo: PrismaTodo = await this.#prismaClient.todo.create({
      data: createData,
    });

    return this.#todoFromPrismaTodoBuilder.build(prismaTodo);
  }

  public async delete(query: FindTodoQuery): Promise<Todo | undefined> {
    const prismaTodo: PrismaTodo | undefined =
      await this.#findPrismaTodo(query);

    if (prismaTodo === undefined) {
      return undefined;
    }

    const deleteData: Prisma.TodoUpdateInput = {
      deleted_at: new Date(),
    };

    try {
      const deletedPrismaTodo: PrismaTodo = await this.#prismaClient.todo.update(
        {
          data: deleteData,
          where: {
            id: prismaTodo.id,
          },
        },
      );

      return this.#todoFromPrismaTodoBuilder.build(deletedPrismaTodo);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return undefined;
      }

      throw error;
    }
  }

  public async findOne(query: FindTodoQuery): Promise<Todo | undefined> {
    const prismaTodo: PrismaTodo | undefined =
      await this.#findPrismaTodo(query);

    if (prismaTodo === undefined) {
      return undefined;
    }

    return this.#todoFromPrismaTodoBuilder.build(prismaTodo);
  }

  public async findMany(query: FindTodosQuery): Promise<FindTodosResult> {
    const where: Prisma.TodoWhereInput = this.#toTodoWhereInput(query);

    const [prismaTodos, totalItems]: [PrismaTodo[], number] = await Promise.all(
      [
        this.#prismaClient.todo.findMany({
          orderBy: {
            created_at: 'desc',
          },
          skip: (query.page - 1) * query.pageSize,
          take: query.pageSize,
          where,
        }),
        this.#prismaClient.todo.count({
          where,
        }),
      ],
    );

    return {
      items: prismaTodos.map((prismaTodo: PrismaTodo): Todo =>
        this.#todoFromPrismaTodoBuilder.build(prismaTodo),
      ),
      totalItems,
    };
  }

  public async update(
    query: FindTodoQuery,
    data: UpdateTodoData,
  ): Promise<Todo | undefined> {
    const prismaTodo: PrismaTodo | undefined =
      await this.#findPrismaTodo(query);

    if (prismaTodo === undefined) {
      return undefined;
    }

    const updateData: Prisma.TodoUpdateInput = {};

    if (('title' satisfies keyof UpdateTodoData) in data && data.title !== undefined) {
      updateData.title = data.title;
    }

    if (
      ('description' satisfies keyof UpdateTodoData) in data &&
      data.description !== undefined
    ) {
      updateData.description = data.description;
    }

    if (
      ('completed' satisfies keyof UpdateTodoData) in data &&
      data.completed !== undefined
    ) {
      updateData.completed = data.completed;
    }

    try {
      const updatedPrismaTodo: PrismaTodo = await this.#prismaClient.todo.update(
        {
          data: updateData,
          where: {
            id: prismaTodo.id,
          },
        },
      );

      return this.#todoFromPrismaTodoBuilder.build(updatedPrismaTodo);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return undefined;
      }

      throw error;
    }
  }

  async #findPrismaTodo(query: FindTodoQuery): Promise<PrismaTodo | undefined> {
    const where: Prisma.TodoWhereInput = this.#toTodoWhereInput(query);

    const prismaTodo: PrismaTodo | null =
      await this.#prismaClient.todo.findFirst({
        where,
      });

    if (prismaTodo === null) {
      return undefined;
    }

    return prismaTodo;
  }

  #toTodoWhereInput(query: FindTodoQuery): Prisma.TodoWhereInput {
    const where: Prisma.TodoWhereInput = {};

    if (
      ('deletedAt' satisfies keyof FindTodoQuery) in query &&
      query.deletedAt !== undefined
    ) {
      where.deleted_at = query.deletedAt;
    }

    if (('id' satisfies keyof FindTodoQuery) in query && query.id !== undefined) {
      where.id = query.id;
    }

    return where;
  }
}
`;
}
