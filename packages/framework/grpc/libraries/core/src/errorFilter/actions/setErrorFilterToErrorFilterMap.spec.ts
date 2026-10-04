import { beforeAll, describe, expect, it, type Mocked, vitest } from 'vitest';

import {
  CatchError,
  Discriminated,
  type ErrorFilter,
} from '@inversifyjs/framework-core';
import { type Logger } from '@inversifyjs/logger';
import { type Newable } from 'inversify';

import { setErrorFilterToErrorFilterMap } from './setErrorFilterToErrorFilterMap.js';

describe(setErrorFilterToErrorFilterMap, () => {
  describe('having an error type that is not registered', () => {
    let discriminatorMapFixture: Map<
      string | symbol,
      ErrorFilter | Newable<ErrorFilter>
    >;
    let errorFilterFixture: Newable<ErrorFilter>;
    let typeMapFixture: Map<
      Newable<Error> | null,
      ErrorFilter | Newable<ErrorFilter>
    >;

    beforeAll(() => {
      @CatchError(TypeError)
      class FirstFilter implements ErrorFilter {
        public catch(): undefined {
          return undefined;
        }
      }

      discriminatorMapFixture = new Map();
      typeMapFixture = new Map();
      errorFilterFixture = FirstFilter;

      setErrorFilterToErrorFilterMap(
        { warn: vitest.fn() } as unknown as Mocked<Logger>,
        discriminatorMapFixture,
        typeMapFixture,
        errorFilterFixture,
      );
    });

    describe('when called', () => {
      it('should register the error filter', () => {
        expect(typeMapFixture.get(TypeError)).toBe(errorFilterFixture);
      });
    });
  });

  describe('having an error type that is already registered', () => {
    let errorFilterFixture: Newable<ErrorFilter>;
    let loggerFixture: Mocked<Logger>;
    let typeMapFixture: Map<
      Newable<Error> | null,
      ErrorFilter | Newable<ErrorFilter>
    >;

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

      loggerFixture = {
        warn: vitest.fn(),
      } as unknown as Mocked<Logger>;
      typeMapFixture = new Map();
      errorFilterFixture = FirstFilter;

      setErrorFilterToErrorFilterMap(
        loggerFixture,
        new Map(),
        typeMapFixture,
        FirstFilter,
      );
      setErrorFilterToErrorFilterMap(
        loggerFixture,
        new Map(),
        typeMapFixture,
        SecondFilter,
      );
    });

    describe('when called', () => {
      it('should keep the first error filter', () => {
        expect(typeMapFixture.get(TypeError)).toBe(errorFilterFixture);
      });

      it('should warn', () => {
        expect(loggerFixture.warn).toHaveBeenCalledExactlyOnceWith(
          "Error filter 'SecondFilter' was not registered for error type 'TypeError' because an error filter is already registered for this error type.",
        );
      });
    });
  });

  describe('having a discriminated error', () => {
    let discriminatorMapFixture: Map<
      string | symbol,
      ErrorFilter | Newable<ErrorFilter>
    >;
    let errorFilterFixture: Newable<ErrorFilter>;

    beforeAll(() => {
      @Discriminated('hero')
      class HeroError extends Error {}

      @CatchError(HeroError)
      class HeroFilter implements ErrorFilter {
        public catch(): undefined {
          return undefined;
        }
      }

      discriminatorMapFixture = new Map();
      errorFilterFixture = HeroFilter;

      setErrorFilterToErrorFilterMap(
        { warn: vitest.fn() } as unknown as Mocked<Logger>,
        discriminatorMapFixture,
        new Map(),
        errorFilterFixture,
      );
    });

    describe('when called', () => {
      it('should register the discriminator', () => {
        expect(discriminatorMapFixture.get('hero')).toBe(errorFilterFixture);
      });
    });
  });
});
