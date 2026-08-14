import { beforeAll, describe, expect, it } from 'vitest';

import { TodoControllerSourceFixtures } from '../fixtures/TodoControllerSourceFixtures.js';
import { generateTodoControllerSource } from './generateTodoControllerSource.js';

describe(generateTodoControllerSource, () => {
  describe('having an express TodoController source model', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(async () => {
        result = await TodoControllerSourceFixtures.withHttpAdapterExpress();
      });

      it('should generate a TodoController with OpenAPI metadata and CRUD endpoints', () => {
        expect(result).toContain(
          "import {\n  Controller,\n  Delete,\n  Get,\n  HttpStatusCode,\n  NotFoundHttpResponse,\n  Patch,\n  Post,\n  StatusCode,\n} from '@inversifyjs/http-core';",
        );
        expect(result).toContain("from '@inversifyjs/http-open-api/v3Dot2'");
        expect(result).toContain(
          "import {\n  ValidatedBody,\n  ValidatedParams,\n  ValidatedQuery,\n} from '@inversifyjs/open-api-validation';",
        );
        expect(result).not.toContain('@inversifyjs/http-uwebsockets');
        expect(result).not.toContain('CaptureRequestValues');
        expect(result).not.toContain('SetHeader');
        expect(result).toContain("@Controller('/v1/todos')");
        expect(result).not.toContain("@Controller('/todos')");
        expect(result).toContain('export class TodoController');
        expect(result).toContain("@OasOperationId('createTodo')");
        expect(result).toContain("@OasOperationId('deleteTodo')");
        expect(result).toContain("@OasOperationId('getTodo')");
        expect(result).toContain("@OasOperationId('listTodos')");
        expect(result).toContain("@OasOperationId('updateTodo')");
        expect(result).toContain("@OasTag('Todos')");
        expect(result).not.toContain("@OasTag('Todos')\nexport class");
        expect(result).toContain(
          '@OasRequestBody((toSchema: ToSchemaFunction)',
        );
        expect(result).toContain('toSchema(CreateTodoV1RequestBody)');
        expect(result).toContain('toSchema(UpdateTodoV1RequestBody)');
        expect(result).toContain('toSchema(PaginatedTodosV1Response)');
        expect(result).toContain('toSchema(TodoV1)');
        expect(result).not.toMatch(/toSchema\(Todo\)(?!V1)/);
        expect(result).toContain("@OasParameter({\n    description: 'Todo id'");
        expect(result).toContain("name: 'page'");
        expect(result).toContain("name: 'pageSize'");
        expect(result).toContain('default: 1');
        expect(result).toContain('default: 10');
        expect(result).toContain('maximum: 20');
        expect(result).toContain('@StatusCode(HttpStatusCode.CREATED)');
        expect(result).toContain('@StatusCode(HttpStatusCode.NO_CONTENT)');
        expect(result).toContain('@Post()');
        expect(result).toContain('@Get()');
        expect(result).toContain("@Get('/:id')");
        expect(result).toContain("@Delete('/:id')");
        expect(result).toContain("@Patch('/:id')");
        expect(result).toContain(
          '@ValidatedBody() body: CreateTodoV1RequestBody',
        );
        expect(result).toContain(
          '@ValidatedBody() body: UpdateTodoV1RequestBody',
        );
        expect(result).toContain('@ValidatedParams() params: { id: string }');
        expect(result).toContain('@ValidatedQuery() query: ListTodosQuery');
        expect(result).toContain('const page: number = query.page ?? 1');
        expect(result).toContain(
          'const pageSize: number = query.pageSize ?? 10',
        );
        expect(result).toContain(
          "if (('title' satisfies keyof UpdateTodoV1RequestBody) in body)",
        );
        expect(result).toContain(
          "if (('description' satisfies keyof UpdateTodoV1RequestBody) in body)",
        );
        expect(result).toContain(
          "if (('completed' satisfies keyof UpdateTodoV1RequestBody) in body)",
        );
        expect(result).toContain('NotFoundHttpResponse');
        expect(result).not.toContain('@Body()');
        expect(result).toContain('todoPersistencePortIdentifier');
        expect(result).toContain('@inject(TodoV1FromTodoBuilder)');
        expect(result).toContain(
          'return this.#todoV1FromTodoBuilder.build(todo);',
        );
        expect(result).toContain('this.#todoV1FromTodoBuilder.build(todo)');
        expect(result).toContain(
          'return this.#todoV1FromTodoBuilder.build(updatedTodo);',
        );
        expect(result).toContain('Promise<TodoV1>');
        expect(result).toContain('Promise<PaginatedTodosV1Response>');
      });
    });
  });

  describe('having a uwebsockets TodoController source model', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(async () => {
        result =
          await TodoControllerSourceFixtures.withHttpAdapterUwebsockets();
      });

      it('should generate CaptureRequestValues for body endpoints and JSON content-type headers', () => {
        expect(result).toContain(
          "import { CaptureRequestValues } from '@inversifyjs/http-uwebsockets';",
        );
        expect(result).toContain('SetHeader');
        expect(result.match(/@CaptureRequestValues/g)).toHaveLength(2);
        expect(
          result.match(/@SetHeader\('Content-Type', 'application\/json'\)/g),
        ).toHaveLength(4);
        expect(result).toContain(
          "@SetHeader('Content-Type', 'application/json')\n  @CaptureRequestValues({ headers: true, method: true, url: true })\n  @Post()",
        );
        expect(result).toContain(
          `@SetHeader('Content-Type', 'application/json')
  @CaptureRequestValues({
    headers: true,
    method: true,
    params: ['id'],
    url: true,
  })
  @Patch('/:id')`,
        );
        expect(result).toContain(
          "@SetHeader('Content-Type', 'application/json')\n  @Get('/:id')\n  public async getTodo",
        );
        expect(result).toContain(
          "@SetHeader('Content-Type', 'application/json')\n  @Get()\n  public async listTodos",
        );
        expect(result).not.toContain(
          "@SetHeader('Content-Type', 'application/json')\n  @Delete('/:id')",
        );
        expect(result).not.toContain(
          "@CaptureRequestValues({ method: true, params: ['id'], url: true })\n  @Delete('/:id')",
        );
        expect(result).not.toContain(
          "@CaptureRequestValues({ method: true, params: ['id'], url: true })\n  @Get('/:id')",
        );
        expect(result).not.toContain(
          '@CaptureRequestValues({ method: true, query: true, url: true })\n  @Get()',
        );
      });
    });
  });
});
