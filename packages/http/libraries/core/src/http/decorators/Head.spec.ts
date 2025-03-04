import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./RequestMethod');

import { RequestMethodType } from '../models/RequestMethodType';
import { HEAD } from './Head';
import { requestMethod } from './RequestMethod';

describe(HEAD.name, () => {
  describe('when called', () => {
    let pathFixture: string | undefined;
    let methodDecoratorFixture: MethodDecorator;
    let result: unknown;

    beforeAll(() => {
      pathFixture = undefined;
      methodDecoratorFixture = {} as MethodDecorator;

      vitest.mocked(requestMethod).mockReturnValueOnce(methodDecoratorFixture);

      result = HEAD(pathFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call requestMethod', () => {
      expect(requestMethod).toHaveBeenCalledTimes(1);
      expect(requestMethod).toHaveBeenCalledWith(
        RequestMethodType.HEAD,
        pathFixture,
      );
    });

    it('should return a MethodDecorator', () => {
      expect(result).toBe(methodDecoratorFixture);
    });
  });
});
