import { beforeAll, describe, expect, it } from 'vitest';

import { generateDeleteTodoUseCaseHandlerSource } from './generateDeleteTodoUseCaseHandlerSource.js';

describe(generateDeleteTodoUseCaseHandlerSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateDeleteTodoUseCaseHandlerSource();
    });

    it('should generate a delete todo use case handler', () => {
      expect(result).toContain('export interface DeleteTodoUseCaseInput');
      expect(result).toContain(
        'export class DeleteTodoUseCaseHandler\n  implements Handler<DeleteTodoUseCaseInput, Promise<Todo | undefined>>',
      );
      expect(result).toContain('this.#todoPersistencePort.delete({');
      expect(result).toContain('deletedAt: null');
      expect(result).not.toContain('NotFoundHttpResponse');
    });
  });
});
