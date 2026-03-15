import { beforeAll, describe, expect, it, type Mock, vitest } from 'vitest';

import { type ErrorFilter } from '@inversifyjs/framework-core';

import { type ControllerResponse } from '../models/ControllerResponse.js';
import { type HttpStatusCode } from '../models/HttpStatusCode.js';
import { buildHttpResponseErrorFilter } from './buildHttpResponseErrorFilter.js';

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
