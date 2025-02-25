import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

jest.mock('./RequestMethod');

import { RequestMethodType } from '../models/RequestMethodType';
import { GET } from './Get';
import { requestMethod } from './RequestMethod';

describe(GET.name, () => {
  describe('when called', () => {
    let pathFixture: string | undefined;
    let methodDecoratorFixture: MethodDecorator;
    let result: unknown;

    beforeAll(() => {
      pathFixture = undefined;
      methodDecoratorFixture = {} as MethodDecorator;

      (requestMethod as jest.Mocked<typeof requestMethod>).mockReturnValueOnce(
        methodDecoratorFixture,
      );

      result = GET(pathFixture);
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call requestMethod', () => {
      expect(requestMethod).toHaveBeenCalledTimes(1);
      expect(requestMethod).toHaveBeenCalledWith(
        RequestMethodType.GET,
        pathFixture,
      );
    });

    it('should return a MethodDecorator', () => {
      expect(result).toBe(methodDecoratorFixture);
    });
  });
});
