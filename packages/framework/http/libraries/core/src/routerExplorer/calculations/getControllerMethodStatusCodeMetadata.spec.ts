import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/prototype-utils');

import { findInPrototypeChain } from '@inversifyjs/prototype-utils';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { getControllerMethodStatusCodeMetadata } from './getControllerMethodStatusCodeMetadata';

describe(getControllerMethodStatusCodeMetadata, () => {
  describe('when called, and findInPrototypeChain() returns a status code', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodKeyFixture: string | symbol;
    let statusCodeMetadataFixture: HttpStatusCode;
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodKeyFixture = 'testMethod';
      statusCodeMetadataFixture = HttpStatusCode.CREATED;

      vitest
        .mocked(findInPrototypeChain)
        .mockReturnValueOnce(statusCodeMetadataFixture);

      result = getControllerMethodStatusCodeMetadata(
        controllerFixture,
        controllerMethodKeyFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call findInPrototypeChain()', () => {
      expect(findInPrototypeChain).toHaveBeenCalledExactlyOnceWith(
        controllerFixture,
        expect.any(Function),
      );
    });

    it('should return the status code', () => {
      expect(result).toBe(statusCodeMetadataFixture);
    });
  });
});
