import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('../calculations/requestMethod.js'));

import { requestMethod } from '../calculations/requestMethod.js';
import { RequestMethodType } from '../models/RequestMethodType.js';
import { Put } from './Put.js';

describe(Put, () => {
  describe('when called', () => {
    let pathFixture: string | undefined;
    let methodDecoratorFixture: (value: Function, context: ClassMethodDecoratorContext) => void;
    let result: unknown;

    beforeAll(() => {
      pathFixture = undefined;
      methodDecoratorFixture = {} as (value: Function, context: ClassMethodDecoratorContext) => void;

      vitest.mocked(requestMethod).mockReturnValueOnce(methodDecoratorFixture);

      result = Put(pathFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call requestMethod', () => {
      expect(requestMethod).toHaveBeenCalledExactlyOnceWith(
        RequestMethodType.Put,
        pathFixture,
      );
    });

    it('should return a (value: Function, context: ClassMethodDecoratorContext) => void', () => {
      expect(result).toBe(methodDecoratorFixture);
    });
  });
});
