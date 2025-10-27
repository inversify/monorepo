import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/prototype-utils');

import { findInPrototypeChain } from '@inversifyjs/prototype-utils';

import { getControllerMethodUseNativeHandlerMetadata } from './getControllerMethodUseNativeHandlerMetadata';

describe(getControllerMethodUseNativeHandlerMetadata, () => {
  describe('when called, and findInPrototypeChain() returns undefined', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodKeyFixture: string | symbol;
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodKeyFixture = 'testMethod';

      vitest.mocked(findInPrototypeChain).mockReturnValueOnce(undefined);

      result = getControllerMethodUseNativeHandlerMetadata(
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

    it('should return false', () => {
      expect(result).toBe(false);
    });
  });

  describe('when called, and findInPrototypeChain() returns a boolean', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodKeyFixture: string | symbol;
    let useNativeHandlerFixture: boolean;
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodKeyFixture = 'testMethod';
      useNativeHandlerFixture = true;

      vitest
        .mocked(findInPrototypeChain)
        .mockReturnValueOnce(useNativeHandlerFixture);

      result = getControllerMethodUseNativeHandlerMetadata(
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

    it('should return a boolean', () => {
      expect(result).toBe(useNativeHandlerFixture);
    });
  });
});
