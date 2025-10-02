import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('../calculations/requestMethod');

import { requestMethod } from '../calculations/requestMethod';
import { RequestMethodType } from '../models/RequestMethodType';
import { Head } from './Head';

describe(Head, () => {
  describe('when called', () => {
    let pathFixture: string | undefined;
    let methodDecoratorFixture: MethodDecorator;
    let result: unknown;

    beforeAll(() => {
      pathFixture = undefined;
      methodDecoratorFixture = {} as MethodDecorator;

      vitest.mocked(requestMethod).mockReturnValueOnce(methodDecoratorFixture);

      result = Head(pathFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call requestMethod', () => {
      expect(requestMethod).toHaveBeenCalledExactlyOnceWith(
        RequestMethodType.Head,
        pathFixture,
      );
    });

    it('should return a MethodDecorator', () => {
      expect(result).toBe(methodDecoratorFixture);
    });
  });
});
