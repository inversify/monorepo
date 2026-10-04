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

    it('should register method error filters before class error filters', () => {
      expect(setErrorFilterToErrorFilterMap).toHaveBeenCalledTimes(2);
      expect(setErrorFilterToErrorFilterMap).toHaveBeenNthCalledWith(
        1,
        loggerFixture,
        result.errorDiscriminatorToErrorFilterMap,
        result.errorTypeToErrorFilterMap,
        methodErrorFilterFixture,
      );
      expect(setErrorFilterToErrorFilterMap).toHaveBeenNthCalledWith(
        2,
        loggerFixture,
        result.errorDiscriminatorToErrorFilterMap,
        result.errorTypeToErrorFilterMap,
        classErrorFilterFixture,
      );
    });

    it('should return ErrorFilterMaps', () => {
      expect(result).toStrictEqual({
        errorDiscriminatorToErrorFilterMap: new Map(),
        errorTypeToErrorFilterMap: new Map(),
      });
    });
  });
});
