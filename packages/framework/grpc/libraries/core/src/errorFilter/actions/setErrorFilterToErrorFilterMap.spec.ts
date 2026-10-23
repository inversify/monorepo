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
      errorFilterFixture = SecondFilter;

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
      it('should override the existing error filter', () => {
        expect(typeMapFixture.get(TypeError)).toBe(errorFilterFixture);
      });

      it('should warn about the override', () => {
        expect(loggerFixture.warn).toHaveBeenCalledExactlyOnceWith(
          "Error filter 'SecondFilter' overrides the error filter already registered for error type 'TypeError'.",
        );
      });
    });
  });

  describe('having the same error filter registered twice', () => {
    let errorFilterFixture: Newable<ErrorFilter>;
    let loggerFixture: Mocked<Logger>;
    let typeMapFixture: Map<
      Newable<Error> | null,
      ErrorFilter | Newable<ErrorFilter>
    >;

    beforeAll(() => {
      @CatchError(TypeError)
      class TypeErrorFilter implements ErrorFilter {
        public catch(): undefined {
          return undefined;
        }
      }

      loggerFixture = {
        warn: vitest.fn(),
      } as unknown as Mocked<Logger>;
      typeMapFixture = new Map();
      errorFilterFixture = TypeErrorFilter;

      setErrorFilterToErrorFilterMap(
        loggerFixture,
        new Map(),
        typeMapFixture,
        TypeErrorFilter,
      );
      setErrorFilterToErrorFilterMap(
        loggerFixture,
        new Map(),
        typeMapFixture,
        TypeErrorFilter,
      );
    });

    describe('when called', () => {
      it('should keep the error filter', () => {
        expect(typeMapFixture.get(TypeError)).toBe(errorFilterFixture);
      });

      it('should not warn', () => {
        expect(loggerFixture.warn).not.toHaveBeenCalled();
      });
    });
  });

  describe('having a catch-all error filter that is already registered', () => {
    let errorFilterFixture: Newable<ErrorFilter>;
    let loggerFixture: Mocked<Logger>;
    let typeMapFixture: Map<
      Newable<Error> | null,
      ErrorFilter | Newable<ErrorFilter>
    >;

    beforeAll(() => {
      @CatchError()
      class FirstFilter implements ErrorFilter {
        public catch(): undefined {
          return undefined;
        }
      }

      @CatchError()
      class SecondFilter implements ErrorFilter {
        public catch(): undefined {
          return undefined;
        }
      }

      loggerFixture = {
        warn: vitest.fn(),
      } as unknown as Mocked<Logger>;
      typeMapFixture = new Map();
      errorFilterFixture = SecondFilter;

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
      it('should override the existing error filter', () => {
        expect(typeMapFixture.get(null)).toBe(errorFilterFixture);
      });

      it('should warn about the override', () => {
        expect(loggerFixture.warn).toHaveBeenCalledExactlyOnceWith(
          "Error filter 'SecondFilter' overrides the error filter already registered for error type 'null (catch-all)'.",
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
    let loggerFixture: Mocked<Logger>;

    beforeAll(() => {
      @Discriminated('hero')
      class HeroError extends Error {}

      @CatchError(HeroError)
      class HeroFilter implements ErrorFilter {
        public catch(): undefined {
          return undefined;
        }
      }

      loggerFixture = {
        warn: vitest.fn(),
      } as unknown as Mocked<Logger>;
      discriminatorMapFixture = new Map();
      errorFilterFixture = HeroFilter;

      setErrorFilterToErrorFilterMap(
        loggerFixture,
        discriminatorMapFixture,
        new Map(),
        errorFilterFixture,
      );
    });

    describe('when called', () => {
      it('should register the discriminator', () => {
        expect(discriminatorMapFixture.get('hero')).toBe(errorFilterFixture);
      });

      it('should not warn', () => {
        expect(loggerFixture.warn).not.toHaveBeenCalled();
      });
    });
  });

  describe('having a discriminated error that is already registered', () => {
    let discriminatorMapFixture: Map<
      string | symbol,
      ErrorFilter | Newable<ErrorFilter>
    >;
    let errorFilterFixture: Newable<ErrorFilter>;
    let loggerFixture: Mocked<Logger>;

    beforeAll(() => {
      @Discriminated('hero')
      class HeroError extends Error {}

      @CatchError(HeroError)
      class FirstHeroFilter implements ErrorFilter {
        public catch(): undefined {
          return undefined;
        }
      }

      @CatchError(HeroError)
      class SecondHeroFilter implements ErrorFilter {
        public catch(): undefined {
          return undefined;
        }
      }

      discriminatorMapFixture = new Map();
      errorFilterFixture = SecondHeroFilter;

      const typeMapFixture: Map<
        Newable<Error> | null,
        ErrorFilter | Newable<ErrorFilter>
      > = new Map();

      loggerFixture = {
        warn: vitest.fn(),
      } as unknown as Mocked<Logger>;

      setErrorFilterToErrorFilterMap(
        loggerFixture,
        discriminatorMapFixture,
        typeMapFixture,
        FirstHeroFilter,
      );
      setErrorFilterToErrorFilterMap(
        loggerFixture,
        discriminatorMapFixture,
        typeMapFixture,
        SecondHeroFilter,
      );
    });

    describe('when called', () => {
      it('should override the discriminator', () => {
        expect(discriminatorMapFixture.get('hero')).toBe(errorFilterFixture);
      });

      it('should warn only about the error type override', () => {
        expect(loggerFixture.warn).toHaveBeenCalledExactlyOnceWith(
          "Error filter 'SecondHeroFilter' overrides the error filter already registered for error type 'HeroError'.",
        );
      });
    });
  });

  describe('having different error types sharing a discriminator', () => {
    let discriminatorMapFixture: Map<
      string | symbol,
      ErrorFilter | Newable<ErrorFilter>
    >;
    let errorFilterFixture: Newable<ErrorFilter>;
    let loggerFixture: Mocked<Logger>;

    beforeAll(() => {
      @Discriminated('hero')
      class HeroError extends Error {}

      @Discriminated('hero')
      class OtherHeroError extends Error {}

      @CatchError(HeroError)
      class HeroFilter implements ErrorFilter {
        public catch(): undefined {
          return undefined;
        }
      }

      @CatchError(OtherHeroError)
      class OtherHeroFilter implements ErrorFilter {
        public catch(): undefined {
          return undefined;
        }
      }

      discriminatorMapFixture = new Map();
      errorFilterFixture = OtherHeroFilter;

      const typeMapFixture: Map<
        Newable<Error> | null,
        ErrorFilter | Newable<ErrorFilter>
      > = new Map();

      loggerFixture = {
        warn: vitest.fn(),
      } as unknown as Mocked<Logger>;

      setErrorFilterToErrorFilterMap(
        loggerFixture,
        discriminatorMapFixture,
        typeMapFixture,
        HeroFilter,
      );
      setErrorFilterToErrorFilterMap(
        loggerFixture,
        discriminatorMapFixture,
        typeMapFixture,
        OtherHeroFilter,
      );
    });

    describe('when called', () => {
      it('should override the discriminator', () => {
        expect(discriminatorMapFixture.get('hero')).toBe(errorFilterFixture);
      });

      it('should not warn', () => {
        expect(loggerFixture.warn).not.toHaveBeenCalled();
      });
    });
  });
});
