import { beforeAll, describe, expect, it, Mock, vitest } from 'vitest';

import { ErrorFilter } from '@inversifyjs/framework-core';

import { ControllerResponse } from '../models/ControllerResponse';
import { HttpStatusCode } from '../models/HttpStatusCode';
import { buildHttpResponseErrorFilter } from './buildHttpResponseErrorFilter';

describe(buildHttpResponseErrorFilter, () => {
  let replyFixture: Mock<
    (
      request: unknown,
      response: unknown,
      value: ControllerResponse,
      statusCode?: HttpStatusCode,
    ) => unknown
  >;

  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      replyFixture = vitest.fn();

      result = buildHttpResponseErrorFilter(replyFixture);
    });

    it('should return an ErrorFilter', () => {
      const expected: ErrorFilter = {
        catch: expect.any(Function),
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
