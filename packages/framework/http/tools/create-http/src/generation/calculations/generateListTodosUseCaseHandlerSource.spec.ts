import { beforeAll, describe, expect, it } from 'vitest';

import { generateListTodosUseCaseHandlerSource } from './generateListTodosUseCaseHandlerSource.js';

describe(generateListTodosUseCaseHandlerSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateListTodosUseCaseHandlerSource();
    });

    it('should generate a list todos use case handler', () => {
      expect(result).toContain('export interface ListTodosUseCaseInput');
      expect(result).toContain('export interface ListTodosUseCaseResult');
      expect(result).toContain(
        'export class ListTodosUseCaseHandler\n  implements Handler<ListTodosUseCaseInput, Promise<ListTodosUseCaseResult>>',
      );
      expect(result).toContain('this.#todoPersistencePort.findMany({');
      expect(result).toContain('deletedAt: null');
      expect(result).not.toContain('NotFoundHttpResponse');
    });
  });
});
