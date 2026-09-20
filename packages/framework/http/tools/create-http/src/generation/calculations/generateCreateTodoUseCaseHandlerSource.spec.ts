import { beforeAll, describe, expect, it } from 'vitest';

import { generateCreateTodoUseCaseHandlerSource } from './generateCreateTodoUseCaseHandlerSource.js';

describe(generateCreateTodoUseCaseHandlerSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateCreateTodoUseCaseHandlerSource();
    });

    it('should generate a create todo use case handler', () => {
      expect(result).toContain(
        "import { type Handler } from '../../../common/domain/modules/Handler.js';",
      );
      expect(result).toContain('export interface CreateTodoUseCaseInput');
      expect(result).toContain(
        'export class CreateTodoUseCaseHandler\n  implements Handler<CreateTodoUseCaseInput, Promise<Todo>>',
      );
      expect(result).toContain('@inject(todoPersistencePortIdentifier)');
      expect(result).toContain(
        'this.#todoPersistencePort.create(createTodoData)',
      );
      expect(result).not.toContain('deletedAt');
      expect(result).not.toContain('NotFoundHttpResponse');
    });
  });
});
