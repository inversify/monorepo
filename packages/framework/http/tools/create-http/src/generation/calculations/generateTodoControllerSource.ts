export function generateTodoControllerSource(): string {
  return `import {
  Controller,
  HttpStatusCode,
  Post,
  StatusCode,
} from '@inversifyjs/http-core';
import {
  OasDescription,
  OasOperationId,
  OasRequestBody,
  OasResponse,
  OasSummary,
  OasTag,
  type ToSchemaFunction,
} from '@inversifyjs/http-open-api';
import { ValidatedBody } from '@inversifyjs/open-api-validation';
import { inject } from 'inversify';

import { todoPersistencePortIdentifier } from '../../application/models/todoPersistencePortIdentifier.js';
import {
  type CreateTodoData,
  type TodoPersistencePort,
} from '../../application/ports/TodoPersistencePort.js';
import { Todo } from '../../domain/models/Todo.js';
import { CreateTodoRequest } from '../models/CreateTodoRequest.js';

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
        schema: toSchema(CreateTodoRequest),
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
    @ValidatedBody() body: CreateTodoRequest,
  ): Promise<Todo> {
    const createTodoData: CreateTodoData = {
      description: body.description,
      title: body.title,
    };

    return this.#todoPersistencePort.create(createTodoData);
  }
}
`;
}
