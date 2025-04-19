import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('../calculations/requestMethod');

import { requestMethod } from '../calculations/requestMethod';
import { RequestMethodType } from '../models/RequestMethodType';
import { POST } from './Post';

describe(POST.name, () => {
  describe('when called', () => {
    let pathFixture: string | undefined;
    let methodDecoratorFixture: MethodDecorator;
    let result: unknown;

    beforeAll(() => {
      pathFixture = undefined;
      methodDecoratorFixture = {} as MethodDecorator;

      vitest.mocked(requestMethod).mockReturnValueOnce(methodDecoratorFixture);

      result = POST(pathFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call requestMethod', () => {
      expect(requestMethod).toHaveBeenCalledTimes(1);
      expect(requestMethod).toHaveBeenCalledWith(
        RequestMethodType.POST,
        pathFixture,
      );
    });

    it('should return a MethodDecorator', () => {
      expect(result).toBe(methodDecoratorFixture);
    });
  });
});
