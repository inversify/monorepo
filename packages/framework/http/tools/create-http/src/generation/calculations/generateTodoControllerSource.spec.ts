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
        expect(result).toContain("@Controller('/todos')");
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
        expect(result).toContain('toSchema(CreateTodoRequestBody)');
        expect(result).toContain('toSchema(UpdateTodoRequestBody)');
        expect(result).toContain('toSchema(PaginatedTodosResponse)');
        expect(result).toContain('toSchema(Todo)');
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
          '@ValidatedBody() body: CreateTodoRequestBody',
        );
        expect(result).toContain(
          '@ValidatedBody() body: UpdateTodoRequestBody',
        );
        expect(result).toContain('@ValidatedParams() params: { id: string }');
        expect(result).toContain('@ValidatedQuery() query: ListTodosQuery');
        expect(result).toContain('const page: number = query.page ?? 1');
        expect(result).toContain(
          'const pageSize: number = query.pageSize ?? 10',
        );
        expect(result).toContain(
          "if (('title' satisfies keyof UpdateTodoRequestBody) in body)",
        );
        expect(result).toContain(
          "if (('description' satisfies keyof UpdateTodoRequestBody) in body)",
        );
        expect(result).toContain(
          "if (('completed' satisfies keyof UpdateTodoRequestBody) in body)",
        );
        expect(result).toContain('NotFoundHttpResponse');
        expect(result).not.toContain('@Body()');
        expect(result).toContain('todoPersistencePortIdentifier');
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

      it('should generate CaptureRequestValues for validated endpoints', () => {
        expect(result).toContain(
          "import { CaptureRequestValues } from '@inversifyjs/http-uwebsockets';",
        );
        expect(result).toContain(
          '@CaptureRequestValues({ headers: true, method: true, url: true })\n  @Post()',
        );
        expect(result).toContain(
          "@CaptureRequestValues({ method: true, params: ['id'], url: true })\n  @Delete('/:id')",
        );
        expect(result).toContain(
          "@CaptureRequestValues({ method: true, params: ['id'], url: true })\n  @Get('/:id')",
        );
        expect(result).toContain(
          '@CaptureRequestValues({ method: true, query: true, url: true })\n  @Get()',
        );
        expect(result).toContain(
          `@CaptureRequestValues({
    headers: true,
    method: true,
    params: ['id'],
    url: true,
  })
  @Patch('/:id')`,
        );
      });
    });
  });
});
