import { beforeAll, describe, expect, it } from 'vitest';

import { generateUpdateTodoUseCaseHandlerSource } from './generateUpdateTodoUseCaseHandlerSource.js';

describe(generateUpdateTodoUseCaseHandlerSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateUpdateTodoUseCaseHandlerSource();
    });

    it('should generate an update todo use case handler', () => {
      expect(result).toContain('export interface UpdateTodoUseCaseInput');
      expect(result).toContain(
        'export class UpdateTodoUseCaseHandler\n  implements Handler<UpdateTodoUseCaseInput, Promise<Todo | undefined>>',
      );
      expect(result).toContain('this.#todoPersistencePort.update(');
      expect(result).toContain('deletedAt: null');
      expect(result).toContain(
        "('title' satisfies keyof UpdateTodoUseCaseInput) in input",
      );
      expect(result).not.toContain('NotFoundHttpResponse');
    });
  });
});
