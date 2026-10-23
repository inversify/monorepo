import { beforeAll, describe, expect, it, type Mocked, vitest } from 'vitest';

import {
  CatchError,
  Discriminated,
  type ErrorFilter,
  UseErrorFilter,
} from '@inversifyjs/framework-core';
import { type Logger } from '@inversifyjs/logger';
import { type Newable } from 'inversify';

import { buildErrorTypeToErrorFilterMap } from './buildErrorTypeToErrorFilterMap.js';

describe(buildErrorTypeToErrorFilterMap, () => {
  describe('having a class error filter and a method error filter for the same error type', () => {
    let discriminatorMapFixture: Map<string | symbol, Newable<ErrorFilter>>;
    let loggerFixture: Mocked<Logger>;
    let methodFilterFixture: Newable<ErrorFilter>;

    let result: Map<Newable<Error> | null, Newable<ErrorFilter>>;

    beforeAll(() => {
      @Discriminated('hero')
      class HeroError extends Error {}

      @CatchError(HeroError)
      class ClassFilter implements ErrorFilter {
        public catch(): undefined {
          return undefined;
        }
      }

      @CatchError(HeroError)
      class MethodFilter implements ErrorFilter {
        public catch(): undefined {
          return undefined;
        }
      }

      @UseErrorFilter(ClassFilter)
      class HeroController {
        @UseErrorFilter(MethodFilter)
        public getHero(): void {}
      }

      methodFilterFixture = MethodFilter;
      discriminatorMapFixture = new Map();
      loggerFixture = {
        warn: vitest.fn(),
      } as unknown as Mocked<Logger>;

      result = buildErrorTypeToErrorFilterMap(
        loggerFixture,
        HeroController,
        'getHero',
        discriminatorMapFixture,
      );
    });

    describe('when called', () => {
      it('should return the method error filter for the error type', () => {
        expect([...result.values()]).toStrictEqual([methodFilterFixture]);
      });

      it('should set the method error filter in the discriminator map', () => {
        expect(discriminatorMapFixture.get('hero')).toBe(methodFilterFixture);
      });

      it('should not warn', () => {
        expect(loggerFixture.warn).not.toHaveBeenCalled();
      });
    });
  });

  describe('having a class error filter and a method error filter for different error types', () => {
    let classFilterFixture: Newable<ErrorFilter>;
    let loggerFixture: Mocked<Logger>;
    let methodFilterFixture: Newable<ErrorFilter>;

    let result: Map<Newable<Error> | null, Newable<ErrorFilter>>;

    beforeAll(() => {
      @CatchError(TypeError)
      class ClassFilter implements ErrorFilter {
        public catch(): undefined {
          return undefined;
        }
      }

      @CatchError(RangeError)
      class MethodFilter implements ErrorFilter {
        public catch(): undefined {
          return undefined;
        }
      }

      @UseErrorFilter(ClassFilter)
      class HeroController {
        @UseErrorFilter(MethodFilter)
        public getHero(): void {}
      }

      classFilterFixture = ClassFilter;
      methodFilterFixture = MethodFilter;
      loggerFixture = {
        warn: vitest.fn(),
      } as unknown as Mocked<Logger>;

      result = buildErrorTypeToErrorFilterMap(
        loggerFixture,
        HeroController,
        'getHero',
        new Map(),
      );
    });

    describe('when called', () => {
      it('should return both error filters', () => {
        expect(result.get(TypeError)).toBe(classFilterFixture);
        expect(result.get(RangeError)).toBe(methodFilterFixture);
      });

      it('should not warn', () => {
        expect(loggerFixture.warn).not.toHaveBeenCalled();
      });
    });
  });

  describe('having two method error filters for the same error type', () => {
    let loggerFixture: Mocked<Logger>;
    let secondFilterFixture: Newable<ErrorFilter>;

    let result: Map<Newable<Error> | null, Newable<ErrorFilter>>;

    beforeAll(() => {
      @CatchError(TypeError)
      class FirstFilter implements ErrorFilter {
        public catch(): undefined {
          return undefined;
        }
      }

      @CatchError(TypeError)
      class SecondFilter implements ErrorFilter {
        public catch(): undefined {
          return undefined;
        }
      }

      class HeroController {
        @UseErrorFilter(FirstFilter, SecondFilter)
        public getHero(): void {}
      }

      secondFilterFixture = SecondFilter;
      loggerFixture = {
        warn: vitest.fn(),
      } as unknown as Mocked<Logger>;

      result = buildErrorTypeToErrorFilterMap(
        loggerFixture,
        HeroController,
        'getHero',
        new Map(),
      );
    });

    describe('when called', () => {
      it('should return the last error filter for the error type', () => {
        expect(result.get(TypeError)).toBe(secondFilterFixture);
      });

      it('should warn about the override', () => {
        expect(loggerFixture.warn).toHaveBeenCalledExactlyOnceWith(
          "Error filter 'SecondFilter' overrides the error filter already registered for error type 'TypeError'.",
        );
      });
    });
  });
});
