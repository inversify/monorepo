import { beforeAll, describe, expect, it } from 'vitest';

import { generateGetTodoUseCaseHandlerSource } from './generateGetTodoUseCaseHandlerSource.js';

describe(generateGetTodoUseCaseHandlerSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateGetTodoUseCaseHandlerSource();
    });

    it('should generate a get todo use case handler', () => {
      expect(result).toContain('export interface GetTodoUseCaseInput');
      expect(result).toContain(
        'export class GetTodoUseCaseHandler\n  implements Handler<GetTodoUseCaseInput, Promise<Todo | undefined>>',
      );
      expect(result).toContain('this.#todoPersistencePort.findOne({');
      expect(result).toContain('deletedAt: null');
      expect(result).not.toContain('NotFoundHttpResponse');
    });
  });
});
