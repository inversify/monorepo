import { beforeAll, describe, expect, it } from 'vitest';

import { TodoControllerSourceFixtures } from '../fixtures/TodoControllerSourceFixtures.js';
import { generateTodoControllerSource } from './generateTodoControllerSource.js';

describe(generateTodoControllerSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = TodoControllerSourceFixtures.any;
    });

    it('should generate a TodoController with OpenAPI metadata and a POST todos endpoint', () => {
      expect(result).toContain(
        "import {\n  Controller,\n  HttpStatusCode,\n  Post,\n  StatusCode,\n} from '@inversifyjs/http-core';",
      );
      expect(result).toContain("from '@inversifyjs/http-open-api'");
      expect(result).toContain(
        "import { ValidatedBody } from '@inversifyjs/open-api-validation';",
      );
      expect(result).toContain("@Controller('/todos')");
      expect(result).toContain('export class TodoController');
      expect(result).toContain("@OasOperationId('createTodo')");
      expect(result).toContain("@OasTag('Todos')");
      expect(result).not.toContain("@OasTag('Todos')\nexport class");
      expect(result).toContain('@OasRequestBody((toSchema: ToSchemaFunction)');
      expect(result).toContain('toSchema(CreateTodoRequest)');
      expect(result).toContain('toSchema(Todo)');
      expect(result).toContain('@StatusCode(HttpStatusCode.CREATED)');
      expect(result).toContain('@Post()');
      expect(result).toContain('@ValidatedBody() body: CreateTodoRequest');
      expect(result).not.toContain('@Body()');
      expect(result).toContain('todoPersistencePortIdentifier');
    });
  });
});
