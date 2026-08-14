import prettier from 'prettier';
import {
  type DecoratorStructure,
  type ImportDeclarationStructure,
  type MethodDeclarationStructure,
  type OptionalKind,
  Project,
  QuoteKind,
  Scope,
  type SourceFile,
} from 'ts-morph';

import {
  type SourceImport,
  type SourceNamedImport,
} from '../models/BootstrapSourceModel.js';
import { SCAFFOLD_PRETTIER_OPTIONS } from '../models/scaffoldPrettierOptions.js';
import {
  type CaptureRequestValuesSourceModel,
  type SetHeaderSourceModel,
  type TodoControllerMethodName,
  type TodoControllerSourceModel,
} from '../models/TodoControllerSourceModel.js';

function toImportDeclarationStructure(
  sourceImport: SourceImport,
): OptionalKind<ImportDeclarationStructure> {
  return {
    ...(sourceImport.defaultImport === undefined
      ? {}
      : { defaultImport: sourceImport.defaultImport }),
    ...(sourceImport.isTypeOnly === undefined
      ? {}
      : { isTypeOnly: sourceImport.isTypeOnly }),
    moduleSpecifier: sourceImport.moduleSpecifier,
    ...(sourceImport.namedImports === undefined
      ? {}
      : {
          namedImports: sourceImport.namedImports.map(
            (namedImport: SourceNamedImport) => ({
              ...(namedImport.alias === undefined
                ? {}
                : { alias: namedImport.alias }),
              ...(namedImport.isTypeOnly === undefined
                ? {}
                : { isTypeOnly: namedImport.isTypeOnly }),
              name: namedImport.name,
            }),
          ),
        }),
    ...(sourceImport.namespaceImport === undefined
      ? {}
      : { namespaceImport: sourceImport.namespaceImport }),
  };
}

function formatCaptureRequestValuesOptions(
  options: CaptureRequestValuesSourceModel,
): string {
  const properties: string[] = [];

  if (options.headers === true) {
    properties.push('headers: true');
  }

  if (options.method === true) {
    properties.push('method: true');
  }

  if (options.params !== undefined) {
    if (options.params === false) {
      properties.push('params: false');
    } else {
      properties.push(
        `params: [${options.params.map((param: string) => `'${param}'`).join(', ')}]`,
      );
    }
  }

  if (options.query === true) {
    properties.push('query: true');
  }

  if (options.url === true) {
    properties.push('url: true');
  }

  return `{ ${properties.join(', ')} }`;
}

function buildCaptureRequestValuesDecorator(
  model: TodoControllerSourceModel,
  methodName: TodoControllerMethodName,
): OptionalKind<DecoratorStructure>[] {
  const options: CaptureRequestValuesSourceModel | undefined =
    model.methodCaptureRequestValues[methodName];

  if (options === undefined) {
    return [];
  }

  return [
    {
      arguments: [formatCaptureRequestValuesOptions(options)],
      name: 'CaptureRequestValues',
    },
  ];
}

function buildSetHeaderDecorators(
  model: TodoControllerSourceModel,
  methodName: TodoControllerMethodName,
): OptionalKind<DecoratorStructure>[] {
  const headers: readonly SetHeaderSourceModel[] | undefined =
    model.methodHeaders[methodName];

  if (headers === undefined) {
    return [];
  }

  return headers.map((header: SetHeaderSourceModel) => ({
    arguments: [`'${header.headerKey}'`, `'${header.value}'`],
    name: 'SetHeader',
  }));
}

function hasMethodHeaders(model: TodoControllerSourceModel): boolean {
  return Object.values(model.methodHeaders).some(
    (headers: readonly SetHeaderSourceModel[] | undefined) =>
      headers !== undefined && headers.length > 0,
  );
}

function buildCreateTodoMethod(
  model: TodoControllerSourceModel,
): OptionalKind<MethodDeclarationStructure> {
  return {
    decorators: [
      { arguments: ["'Create a todo'"], name: 'OasSummary' },
      {
        arguments: ["'Creates a new todo item'"],
        name: 'OasDescription',
      },
      { arguments: ["'createTodo'"], name: 'OasOperationId' },
      { arguments: ["'Todos'"], name: 'OasTag' },
      {
        arguments: [
          `(toSchema: ToSchemaFunction) => ({
  content: {
    'application/json': {
      schema: toSchema(CreateTodoV1RequestBody),
    },
  },
  description: 'Todo create request',
  required: true,
})`,
        ],
        name: 'OasRequestBody',
      },
      {
        arguments: [
          `HttpStatusCode.CREATED`,
          `(toSchema: ToSchemaFunction) => ({
  content: {
    'application/json': {
      schema: toSchema(TodoV1),
    },
  },
  description: 'Todo created',
})`,
        ],
        name: 'OasResponse',
      },
      {
        arguments: ['HttpStatusCode.CREATED'],
        name: 'StatusCode',
      },
      ...buildSetHeaderDecorators(model, 'createTodo'),
      ...buildCaptureRequestValuesDecorator(model, 'createTodo'),
      { arguments: [], name: 'Post' },
    ],
    isAsync: true,
    name: 'createTodo',
    parameters: [
      {
        decorators: [{ arguments: [], name: 'ValidatedBody' }],
        name: 'body',
        type: 'CreateTodoV1RequestBody',
      },
    ],
    returnType: 'Promise<TodoV1>',
    scope: Scope.Public,
    statements: [
      `const createTodoData: CreateTodoData = {
  description: body.description,
  title: body.title,
};`,
      `const todo: Todo = await this.#todoPersistencePort.create(createTodoData);`,
      'return this.#todoV1FromTodoBuilder.build(todo);',
    ],
  };
}

function buildDeleteTodoMethod(
  model: TodoControllerSourceModel,
): OptionalKind<MethodDeclarationStructure> {
  return {
    decorators: [
      { arguments: ["'Delete a todo'"], name: 'OasSummary' },
      {
        arguments: ["'Soft-deletes a todo item by id'"],
        name: 'OasDescription',
      },
      { arguments: ["'deleteTodo'"], name: 'OasOperationId' },
      { arguments: ["'Todos'"], name: 'OasTag' },
      {
        arguments: [
          `{
  description: 'Todo id',
  in: 'path',
  name: 'id',
  required: true,
  schema: {
    format: 'uuid',
    type: 'string',
  },
}`,
        ],
        name: 'OasParameter',
      },
      {
        arguments: [
          'HttpStatusCode.NO_CONTENT',
          `{
  description: 'Todo deleted',
}`,
        ],
        name: 'OasResponse',
      },
      {
        arguments: [
          'HttpStatusCode.NOT_FOUND',
          `{
  description: 'Todo not found',
}`,
        ],
        name: 'OasResponse',
      },
      {
        arguments: ['HttpStatusCode.NO_CONTENT'],
        name: 'StatusCode',
      },
      ...buildSetHeaderDecorators(model, 'deleteTodo'),
      ...buildCaptureRequestValuesDecorator(model, 'deleteTodo'),
      { arguments: ["'/:id'"], name: 'Delete' },
    ],
    isAsync: true,
    name: 'deleteTodo',
    parameters: [
      {
        decorators: [{ arguments: [], name: 'ValidatedParams' }],
        name: 'params',
        type: '{ id: string }',
      },
    ],
    returnType: 'Promise<void>',
    scope: Scope.Public,
    statements: [
      `const deletedTodo: Todo | undefined =
  await this.#todoPersistencePort.delete(params.id);`,
      `if (deletedTodo === undefined) {
  throw new NotFoundHttpResponse(
    { message: 'Todo not found' },
    'Todo not found',
  );
}`,
    ],
  };
}

function buildGetTodoMethod(
  model: TodoControllerSourceModel,
): OptionalKind<MethodDeclarationStructure> {
  return {
    decorators: [
      { arguments: ["'Get a todo'"], name: 'OasSummary' },
      {
        arguments: ["'Returns a todo item by id'"],
        name: 'OasDescription',
      },
      { arguments: ["'getTodo'"], name: 'OasOperationId' },
      { arguments: ["'Todos'"], name: 'OasTag' },
      {
        arguments: [
          `{
  description: 'Todo id',
  in: 'path',
  name: 'id',
  required: true,
  schema: {
    format: 'uuid',
    type: 'string',
  },
}`,
        ],
        name: 'OasParameter',
      },
      {
        arguments: [
          'HttpStatusCode.OK',
          `(toSchema: ToSchemaFunction) => ({
  content: {
    'application/json': {
      schema: toSchema(TodoV1),
    },
  },
  description: 'Todo found',
})`,
        ],
        name: 'OasResponse',
      },
      {
        arguments: [
          'HttpStatusCode.NOT_FOUND',
          `{
  description: 'Todo not found',
}`,
        ],
        name: 'OasResponse',
      },
      ...buildSetHeaderDecorators(model, 'getTodo'),
      ...buildCaptureRequestValuesDecorator(model, 'getTodo'),
      { arguments: ["'/:id'"], name: 'Get' },
    ],
    isAsync: true,
    name: 'getTodo',
    parameters: [
      {
        decorators: [{ arguments: [], name: 'ValidatedParams' }],
        name: 'params',
        type: '{ id: string }',
      },
    ],
    returnType: 'Promise<TodoV1>',
    scope: Scope.Public,
    statements: [
      `const todo: Todo | undefined = await this.#todoPersistencePort.findById(
  params.id,
);`,
      `if (todo === undefined) {
  throw new NotFoundHttpResponse(
    { message: 'Todo not found' },
    'Todo not found',
  );
}`,
      'return this.#todoV1FromTodoBuilder.build(todo);',
    ],
  };
}

function buildListTodosMethod(
  model: TodoControllerSourceModel,
): OptionalKind<MethodDeclarationStructure> {
  return {
    decorators: [
      { arguments: ["'List todos'"], name: 'OasSummary' },
      {
        arguments: ["'Returns a paginated list of todo items'"],
        name: 'OasDescription',
      },
      { arguments: ["'listTodos'"], name: 'OasOperationId' },
      { arguments: ["'Todos'"], name: 'OasTag' },
      {
        arguments: [
          `{
  description: 'Page number (1-based)',
  in: 'query',
  name: 'page',
  required: false,
  schema: {
    default: 1,
    minimum: 1,
    type: 'integer',
  },
}`,
        ],
        name: 'OasParameter',
      },
      {
        arguments: [
          `{
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
}`,
        ],
        name: 'OasParameter',
      },
      {
        arguments: [
          'HttpStatusCode.OK',
          `(toSchema: ToSchemaFunction) => ({
  content: {
    'application/json': {
      schema: toSchema(PaginatedTodosV1Response),
    },
  },
  description: 'Paginated todos',
})`,
        ],
        name: 'OasResponse',
      },
      ...buildSetHeaderDecorators(model, 'listTodos'),
      ...buildCaptureRequestValuesDecorator(model, 'listTodos'),
      { arguments: [], name: 'Get' },
    ],
    isAsync: true,
    name: 'listTodos',
    parameters: [
      {
        decorators: [{ arguments: [], name: 'ValidatedQuery' }],
        name: 'query',
        type: 'ListTodosQuery',
      },
    ],
    returnType: 'Promise<PaginatedTodosV1Response>',
    scope: Scope.Public,
    statements: [
      'const page: number = query.page ?? 1;',
      'const pageSize: number = query.pageSize ?? 10;',
      `const result: FindTodosResult = await this.#todoPersistencePort.findMany({
  page,
  pageSize,
});`,
      `return {
  items: result.items.map((todo: Todo): TodoV1 =>
    this.#todoV1FromTodoBuilder.build(todo),
  ),
  page,
  pageSize,
  totalItems: result.totalItems,
};`,
    ],
  };
}

function buildUpdateTodoMethod(
  model: TodoControllerSourceModel,
): OptionalKind<MethodDeclarationStructure> {
  return {
    decorators: [
      { arguments: ["'Update a todo'"], name: 'OasSummary' },
      {
        arguments: ["'Updates an existing todo item'"],
        name: 'OasDescription',
      },
      { arguments: ["'updateTodo'"], name: 'OasOperationId' },
      { arguments: ["'Todos'"], name: 'OasTag' },
      {
        arguments: [
          `{
  description: 'Todo id',
  in: 'path',
  name: 'id',
  required: true,
  schema: {
    format: 'uuid',
    type: 'string',
  },
}`,
        ],
        name: 'OasParameter',
      },
      {
        arguments: [
          `(toSchema: ToSchemaFunction) => ({
  content: {
    'application/json': {
      schema: toSchema(UpdateTodoV1RequestBody),
    },
  },
  description: 'Todo update request',
  required: true,
})`,
        ],
        name: 'OasRequestBody',
      },
      {
        arguments: [
          'HttpStatusCode.OK',
          `(toSchema: ToSchemaFunction) => ({
  content: {
    'application/json': {
      schema: toSchema(TodoV1),
    },
  },
  description: 'Todo updated',
})`,
        ],
        name: 'OasResponse',
      },
      {
        arguments: [
          'HttpStatusCode.NOT_FOUND',
          `{
  description: 'Todo not found',
}`,
        ],
        name: 'OasResponse',
      },
      ...buildSetHeaderDecorators(model, 'updateTodo'),
      ...buildCaptureRequestValuesDecorator(model, 'updateTodo'),
      { arguments: ["'/:id'"], name: 'Patch' },
    ],
    isAsync: true,
    name: 'updateTodo',
    parameters: [
      {
        decorators: [{ arguments: [], name: 'ValidatedParams' }],
        name: 'params',
        type: '{ id: string }',
      },
      {
        decorators: [{ arguments: [], name: 'ValidatedBody' }],
        name: 'body',
        type: 'UpdateTodoV1RequestBody',
      },
    ],
    returnType: 'Promise<TodoV1>',
    scope: Scope.Public,
    statements: [
      'const updateTodoData: UpdateTodoData = {};',
      `if (('title' satisfies keyof UpdateTodoV1RequestBody) in body) {
  updateTodoData.title = body.title;
}`,
      `if (('description' satisfies keyof UpdateTodoV1RequestBody) in body) {
  updateTodoData.description = body.description;
}`,
      `if (('completed' satisfies keyof UpdateTodoV1RequestBody) in body) {
  updateTodoData.completed = body.completed;
}`,
      `const updatedTodo: Todo | undefined = await this.#todoPersistencePort.update(
  params.id,
  updateTodoData,
);`,
      `if (updatedTodo === undefined) {
  throw new NotFoundHttpResponse(
    { message: 'Todo not found' },
    'Todo not found',
  );
}`,
      'return this.#todoV1FromTodoBuilder.build(updatedTodo);',
    ],
  };
}

export async function generateTodoControllerSource(
  model: TodoControllerSourceModel,
): Promise<string> {
  const project: Project = new Project({
    manipulationSettings: {
      quoteKind: QuoteKind.Single,
      useTrailingCommas: true,
    },
    useInMemoryFileSystem: true,
  });

  const sourceFile: SourceFile = project.createSourceFile('TodoController.ts');

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@inversifyjs/http-core',
    namedImports: [
      { name: 'Controller' },
      { name: 'Delete' },
      { name: 'Get' },
      { name: 'HttpStatusCode' },
      { name: 'NotFoundHttpResponse' },
      { name: 'Patch' },
      { name: 'Post' },
      ...(hasMethodHeaders(model) ? [{ name: 'SetHeader' }] : []),
      { name: 'StatusCode' },
    ],
  });

  for (const sourceImport of model.imports) {
    sourceFile.addImportDeclaration(toImportDeclarationStructure(sourceImport));
  }

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@inversifyjs/http-open-api/v3Dot2',
    namedImports: [
      { name: 'OasDescription' },
      { name: 'OasOperationId' },
      { name: 'OasParameter' },
      { name: 'OasRequestBody' },
      { name: 'OasResponse' },
      { name: 'OasSummary' },
      { name: 'OasTag' },
      { isTypeOnly: true, name: 'ToSchemaFunction' },
    ],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@inversifyjs/open-api-validation',
    namedImports: [
      { name: 'ValidatedBody' },
      { name: 'ValidatedParams' },
      { name: 'ValidatedQuery' },
    ],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: 'inversify',
    namedImports: [{ name: 'inject' }],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier:
      '../../application/models/todoPersistencePortIdentifier.js',
    namedImports: [{ name: 'todoPersistencePortIdentifier' }],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '../../application/ports/TodoPersistencePort.js',
    namedImports: [
      { isTypeOnly: true, name: 'CreateTodoData' },
      { isTypeOnly: true, name: 'FindTodosResult' },
      { isTypeOnly: true, name: 'TodoPersistencePort' },
      { isTypeOnly: true, name: 'UpdateTodoData' },
    ],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '../../domain/models/Todo.js',
    namedImports: [{ isTypeOnly: true, name: 'Todo' }],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '../builders/TodoV1FromTodoBuilder.js',
    namedImports: [{ name: 'TodoV1FromTodoBuilder' }],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '../models/CreateTodoV1RequestBody.js',
    namedImports: [{ name: 'CreateTodoV1RequestBody' }],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '../models/PaginatedTodosV1Response.js',
    namedImports: [{ name: 'PaginatedTodosV1Response' }],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '../models/TodoV1.js',
    namedImports: [{ name: 'TodoV1' }],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '../models/UpdateTodoV1RequestBody.js',
    namedImports: [{ name: 'UpdateTodoV1RequestBody' }],
  });

  sourceFile.addInterface({
    name: 'ListTodosQuery',
    properties: [
      {
        hasQuestionToken: true,
        name: 'page',
        type: 'number',
      },
      {
        hasQuestionToken: true,
        name: 'pageSize',
        type: 'number',
      },
    ],
  });

  sourceFile.addClass({
    ctors: [
      {
        parameters: [
          {
            decorators: [
              {
                arguments: ['todoPersistencePortIdentifier'],
                name: 'inject',
              },
            ],
            name: 'todoPersistencePort',
            type: 'TodoPersistencePort',
          },
          {
            decorators: [
              {
                arguments: ['TodoV1FromTodoBuilder'],
                name: 'inject',
              },
            ],
            name: 'todoV1FromTodoBuilder',
            type: 'TodoV1FromTodoBuilder',
          },
        ],
        statements: [
          'this.#todoPersistencePort = todoPersistencePort;',
          'this.#todoV1FromTodoBuilder = todoV1FromTodoBuilder;',
        ],
      },
    ],
    decorators: [{ arguments: ["'/v1/todos'"], name: 'Controller' }],
    isExported: true,
    methods: [
      buildCreateTodoMethod(model),
      buildDeleteTodoMethod(model),
      buildGetTodoMethod(model),
      buildListTodosMethod(model),
      buildUpdateTodoMethod(model),
    ],
    name: 'TodoController',
    properties: [
      {
        isReadonly: true,
        name: '#todoPersistencePort',
        type: 'TodoPersistencePort',
      },
      {
        isReadonly: true,
        name: '#todoV1FromTodoBuilder',
        type: 'TodoV1FromTodoBuilder',
      },
    ],
  });

  return prettier.format(sourceFile.getFullText(), SCAFFOLD_PRETTIER_OPTIONS);
}
