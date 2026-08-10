export function generateTodoControllerSource(): string {
  return `import {
  Controller,
  Delete,
  Get,
  HttpStatusCode,
  NotFoundHttpResponse,
  Patch,
  Post,
  StatusCode,
} from '@inversifyjs/http-core';
import {
  OasDescription,
  OasOperationId,
  OasParameter,
  OasRequestBody,
  OasResponse,
  OasSummary,
  OasTag,
  type ToSchemaFunction,
} from '@inversifyjs/http-open-api/v3Dot2';
import {
  ValidatedBody,
  ValidatedParams,
  ValidatedQuery,
} from '@inversifyjs/open-api-validation';
import { inject } from 'inversify';

import { todoPersistencePortIdentifier } from '../../application/models/todoPersistencePortIdentifier.js';
import {
  type CreateTodoData,
  type FindTodosResult,
  type TodoPersistencePort,
  type UpdateTodoData,
} from '../../application/ports/TodoPersistencePort.js';
import { Todo } from '../../domain/models/Todo.js';
import { CreateTodoRequestBody } from '../models/CreateTodoRequestBody.js';
import { PaginatedTodosResponse } from '../models/PaginatedTodosResponse.js';
import { UpdateTodoRequestBody } from '../models/UpdateTodoRequestBody.js';

interface ListTodosQuery {
  page?: number;
  pageSize?: number;
}

@Controller('/todos')
export class TodoController {
  readonly #todoPersistencePort: TodoPersistencePort;

  constructor(
    @inject(todoPersistencePortIdentifier)
    todoPersistencePort: TodoPersistencePort,
  ) {
    this.#todoPersistencePort = todoPersistencePort;
  }

  @OasSummary('Create a todo')
  @OasDescription('Creates a new todo item')
  @OasOperationId('createTodo')
  @OasTag('Todos')
  @OasRequestBody((toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: toSchema(CreateTodoRequestBody),
      },
    },
    description: 'Todo create request',
    required: true,
  }))
  @OasResponse(HttpStatusCode.CREATED, (toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: toSchema(Todo),
      },
    },
    description: 'Todo created',
  }))
  @StatusCode(HttpStatusCode.CREATED)
  @Post()
  public async createTodo(
    @ValidatedBody() body: CreateTodoRequestBody,
  ): Promise<Todo> {
    const createTodoData: CreateTodoData = {
      description: body.description,
      title: body.title,
    };

    return this.#todoPersistencePort.create(createTodoData);
  }

  @OasSummary('Delete a todo')
  @OasDescription('Soft-deletes a todo item by id')
  @OasOperationId('deleteTodo')
  @OasTag('Todos')
  @OasParameter({
    description: 'Todo id',
    in: 'path',
    name: 'id',
    required: true,
    schema: {
      format: 'uuid',
      type: 'string',
    },
  })
  @OasResponse(HttpStatusCode.NO_CONTENT, {
    description: 'Todo deleted',
  })
  @OasResponse(HttpStatusCode.NOT_FOUND, {
    description: 'Todo not found',
  })
  @StatusCode(HttpStatusCode.NO_CONTENT)
  @Delete('/:id')
  public async deleteTodo(
    @ValidatedParams() params: { id: string },
  ): Promise<void> {
    const deletedTodo: Todo | undefined =
      await this.#todoPersistencePort.delete(params.id);

    if (deletedTodo === undefined) {
      throw new NotFoundHttpResponse(
        { message: 'Todo not found' },
        'Todo not found',
      );
    }
  }

  @OasSummary('Get a todo')
  @OasDescription('Returns a todo item by id')
  @OasOperationId('getTodo')
  @OasTag('Todos')
  @OasParameter({
    description: 'Todo id',
    in: 'path',
    name: 'id',
    required: true,
    schema: {
      format: 'uuid',
      type: 'string',
    },
  })
  @OasResponse(HttpStatusCode.OK, (toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: toSchema(Todo),
      },
    },
    description: 'Todo found',
  }))
  @OasResponse(HttpStatusCode.NOT_FOUND, {
    description: 'Todo not found',
  })
  @Get('/:id')
  public async getTodo(
    @ValidatedParams() params: { id: string },
  ): Promise<Todo> {
    const todo: Todo | undefined = await this.#todoPersistencePort.findById(
      params.id,
    );

    if (todo === undefined) {
      throw new NotFoundHttpResponse(
        { message: 'Todo not found' },
        'Todo not found',
      );
    }

    return todo;
  }

  @OasSummary('List todos')
  @OasDescription('Returns a paginated list of todo items')
  @OasOperationId('listTodos')
  @OasTag('Todos')
  @OasParameter({
    description: 'Page number (1-based)',
    in: 'query',
    name: 'page',
    required: false,
    schema: {
      default: 1,
      minimum: 1,
      type: 'integer',
    },
  })
  @OasParameter({
    description: 'Number of items per page',
    in: 'query',
    name: 'pageSize',
    required: false,
    schema: {
      default: 10,
      maximum: 20,
      minimum: 1,
      type: 'integer',
    },
  })
  @OasResponse(HttpStatusCode.OK, (toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: toSchema(PaginatedTodosResponse),
      },
    },
    description: 'Paginated todos',
  }))
  @Get()
  public async listTodos(
    @ValidatedQuery() query: ListTodosQuery,
  ): Promise<PaginatedTodosResponse> {
    const page: number = query.page ?? 1;
    const pageSize: number = query.pageSize ?? 10;

    const result: FindTodosResult = await this.#todoPersistencePort.findMany({
      page,
      pageSize,
    });

    return {
      items: result.items,
      page,
      pageSize,
      totalItems: result.totalItems,
    };
  }

  @OasSummary('Update a todo')
  @OasDescription('Updates an existing todo item')
  @OasOperationId('updateTodo')
  @OasTag('Todos')
  @OasParameter({
    description: 'Todo id',
    in: 'path',
    name: 'id',
    required: true,
    schema: {
      format: 'uuid',
      type: 'string',
    },
  })
  @OasRequestBody((toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: toSchema(UpdateTodoRequestBody),
      },
    },
    description: 'Todo update request',
    required: true,
  }))
  @OasResponse(HttpStatusCode.OK, (toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: toSchema(Todo),
      },
    },
    description: 'Todo updated',
  }))
  @OasResponse(HttpStatusCode.NOT_FOUND, {
    description: 'Todo not found',
  })
  @Patch('/:id')
  public async updateTodo(
    @ValidatedParams() params: { id: string },
    @ValidatedBody() body: UpdateTodoRequestBody,
  ): Promise<Todo> {
    const updateTodoData: UpdateTodoData = {};

    if (('title' satisfies keyof UpdateTodoRequestBody) in body) {
      updateTodoData.title = body.title;
    }

    if (('description' satisfies keyof UpdateTodoRequestBody) in body) {
      updateTodoData.description = body.description;
    }

    if (('completed' satisfies keyof UpdateTodoRequestBody) in body) {
      updateTodoData.completed = body.completed;
    }

    const updatedTodo: Todo | undefined = await this.#todoPersistencePort.update(
      params.id,
      updateTodoData,
    );

    if (updatedTodo === undefined) {
      throw new NotFoundHttpResponse(
        { message: 'Todo not found' },
        'Todo not found',
      );
    }

    return updatedTodo;
  }
}
`;
}
