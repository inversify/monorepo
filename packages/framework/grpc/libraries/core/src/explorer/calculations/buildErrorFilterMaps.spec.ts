import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/framework-core'));
vitest.mock(
  import('../../errorFilter/actions/setErrorFilterToErrorFilterMap.js'),
);

import {
  type ErrorFilter,
  getClassErrorFilterMetadata,
  getClassMethodErrorFilterMetadata,
} from '@inversifyjs/framework-core';
import { type Logger } from '@inversifyjs/logger';
import { type Newable } from 'inversify';

import { setErrorFilterToErrorFilterMap } from '../../errorFilter/actions/setErrorFilterToErrorFilterMap.js';
import {
  buildErrorFilterMaps,
  type ErrorFilterMaps,
} from './buildErrorFilterMaps.js';

describe(buildErrorFilterMaps, () => {
  describe('when called', () => {
    let classErrorFilterFixture: Newable<ErrorFilter>;
    let loggerFixture: Logger;
    let methodErrorFilterFixture: Newable<ErrorFilter>;
    let methodKeyFixture: string;
    let targetFixture: NewableFunction;
    let result: ErrorFilterMaps;

    beforeAll(() => {
      classErrorFilterFixture = class ClassFilter {
        public catch(): void {}
      };
      loggerFixture = Symbol() as unknown as Logger;
      methodErrorFilterFixture = class MethodFilter {
        public catch(): void {}
      };
      methodKeyFixture = 'getHero';
      targetFixture = class HeroService {};

      vitest
        .mocked(getClassMethodErrorFilterMetadata)
        .mockReturnValueOnce(new Set([methodErrorFilterFixture]));
      vitest
        .mocked(getClassErrorFilterMetadata)
        .mockReturnValueOnce(new Set([classErrorFilterFixture]));

      result = buildErrorFilterMaps(
        loggerFixture,
        targetFixture,
        methodKeyFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getClassMethodErrorFilterMetadata()', () => {
      expect(getClassMethodErrorFilterMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        methodKeyFixture,
      );
    });

    it('should call getClassErrorFilterMetadata()', () => {
      expect(getClassErrorFilterMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
      );
    });

    it('should register class error filters before method error filters', () => {
      expect(setErrorFilterToErrorFilterMap).toHaveBeenCalledTimes(2);
      expect(setErrorFilterToErrorFilterMap).toHaveBeenNthCalledWith(
        1,
        loggerFixture,
        result.errorDiscriminatorToErrorFilterMap,
        expect.any(Map),
        classErrorFilterFixture,
      );
      expect(setErrorFilterToErrorFilterMap).toHaveBeenNthCalledWith(
        2,
        loggerFixture,
        result.errorDiscriminatorToErrorFilterMap,
        expect.any(Map),
        methodErrorFilterFixture,
      );
    });

    it('should register class and method error filters in separate error type maps', () => {
      const [classCall, methodCall]: unknown[][] = vitest.mocked(
        setErrorFilterToErrorFilterMap,
      ).mock.calls;

      expect(classCall?.[2]).not.toBe(methodCall?.[2]);
    });

    it('should return ErrorFilterMaps', () => {
      expect(result).toStrictEqual({
        errorDiscriminatorToErrorFilterMap: new Map(),
        errorTypeToErrorFilterMap: new Map(),
      });
    });
  });

  describe('when called, and class and method error filters are registered for the same error type', () => {
    let classErrorFilterFixture: Newable<ErrorFilter>;
    let methodErrorFilterFixture: Newable<ErrorFilter>;
    let result: ErrorFilterMaps;

    beforeAll(() => {
      classErrorFilterFixture = class ClassFilter {
        public catch(): void {}
      };
      methodErrorFilterFixture = class MethodFilter {
        public catch(): void {}
      };

      vitest
        .mocked(getClassMethodErrorFilterMetadata)
        .mockReturnValueOnce(new Set([methodErrorFilterFixture]));
      vitest
        .mocked(getClassErrorFilterMetadata)
        .mockReturnValueOnce(new Set([classErrorFilterFixture]));

      vitest
        .mocked(setErrorFilterToErrorFilterMap)
        .mockImplementationOnce(
          (
            _logger: Logger,
            _errorDiscriminatorToErrorFilterMap: unknown,
            errorTypeToErrorFilterMap: Map<
              Newable<Error> | null,
              ErrorFilter | Newable<ErrorFilter>
            >,
            errorFilter: Newable<ErrorFilter>,
          ): void => {
            errorTypeToErrorFilterMap.set(Error, errorFilter);
            errorTypeToErrorFilterMap.set(TypeError, errorFilter);
          },
        )
        .mockImplementationOnce(
          (
            _logger: Logger,
            _errorDiscriminatorToErrorFilterMap: unknown,
            errorTypeToErrorFilterMap: Map<
              Newable<Error> | null,
              ErrorFilter | Newable<ErrorFilter>
            >,
            errorFilter: Newable<ErrorFilter>,
          ): void => {
            errorTypeToErrorFilterMap.set(Error, errorFilter);
          },
        );

      result = buildErrorFilterMaps(
        Symbol() as unknown as Logger,
        class HeroService {},
        'getHero',
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return the method error filter for the shared error type', () => {
      expect(result.errorTypeToErrorFilterMap.get(Error)).toBe(
        methodErrorFilterFixture,
      );
    });

    it('should keep the class error filter for the other error types', () => {
      expect(result.errorTypeToErrorFilterMap.get(TypeError)).toBe(
        classErrorFilterFixture,
      );
    });
  });
});
