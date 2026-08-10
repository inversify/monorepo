export function generatePrismaTodoPersistenceAdapterSource(): string {
  return `import { inject, injectable } from 'inversify';

import { PrismaClient, type Todo as PrismaTodo } from '../../../generated/prisma/client.js';
import {
  type CreateTodoData,
  type FindTodosQuery,
  type FindTodosResult,
  type TodoPersistencePort,
  type UpdateTodoData,
} from '../../application/ports/TodoPersistencePort.js';
import { type Todo } from '../../domain/models/Todo.js';

@injectable()
export class PrismaTodoPersistenceAdapter implements TodoPersistencePort {
  readonly #prismaClient: PrismaClient;

  constructor(@inject(PrismaClient) prismaClient: PrismaClient) {
    this.#prismaClient = prismaClient;
  }

  public async create(data: CreateTodoData): Promise<Todo> {
    const prismaTodo: PrismaTodo = await this.#prismaClient.todo.create({
      data: {
        description: data.description,
        title: data.title,
      },
    });

    return this.#mapTodo(prismaTodo);
  }

  public async delete(id: string): Promise<Todo | undefined> {
    const existingTodo: PrismaTodo | null =
      await this.#prismaClient.todo.findFirst({
        where: {
          deleted_at: null,
          id,
        },
      });

    if (existingTodo === null) {
      return undefined;
    }

    const prismaTodo: PrismaTodo = await this.#prismaClient.todo.update({
      data: {
        deleted_at: new Date(),
      },
      where: {
        id,
      },
    });

    return this.#mapTodo(prismaTodo);
  }

  public async findById(id: string): Promise<Todo | undefined> {
    const prismaTodo: PrismaTodo | null =
      await this.#prismaClient.todo.findFirst({
        where: {
          deleted_at: null,
          id,
        },
      });

    if (prismaTodo === null) {
      return undefined;
    }

    return this.#mapTodo(prismaTodo);
  }

  public async findMany(query: FindTodosQuery): Promise<FindTodosResult> {
    const where = {
      deleted_at: null,
    };

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
        this.#mapTodo(prismaTodo),
      ),
      totalItems,
    };
  }

  public async update(
    id: string,
    data: UpdateTodoData,
  ): Promise<Todo | undefined> {
    const existingTodo: PrismaTodo | null =
      await this.#prismaClient.todo.findFirst({
        where: {
          deleted_at: null,
          id,
        },
      });

    if (existingTodo === null) {
      return undefined;
    }

    const updateData: {
      completed?: boolean;
      description?: string;
      title?: string;
    } = {};

    if (('title' satisfies keyof UpdateTodoData) in data) {
      updateData.title = data.title;
    }

    if (('description' satisfies keyof UpdateTodoData) in data) {
      updateData.description = data.description;
    }

    if (('completed' satisfies keyof UpdateTodoData) in data) {
      updateData.completed = data.completed;
    }

    const prismaTodo: PrismaTodo = await this.#prismaClient.todo.update({
      data: updateData,
      where: {
        id,
      },
    });

    return this.#mapTodo(prismaTodo);
  }

  #mapTodo(prismaTodo: PrismaTodo): Todo {
    return {
      completed: prismaTodo.completed,
      created_at: prismaTodo.created_at,
      deleted_at: prismaTodo.deleted_at,
      description: prismaTodo.description,
      id: prismaTodo.id,
      title: prismaTodo.title,
      updated_at: prismaTodo.updated_at,
    };
  }
}
`;
}
