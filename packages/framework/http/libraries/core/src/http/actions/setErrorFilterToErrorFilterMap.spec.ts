import { beforeAll, describe, expect, it, type Mocked, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/framework-core'));

import {
  type ErrorFilter,
  getCatchErrorMetadata,
  getErrorDiscriminatorMetadata,
} from '@inversifyjs/framework-core';
import { type Logger } from '@inversifyjs/logger';
import { type Newable } from 'inversify';

import { setErrorFilterToErrorFilterMap } from './setErrorFilterToErrorFilterMap.js';

describe(setErrorFilterToErrorFilterMap, () => {
  let errorDiscriminatorToErrorFilterMapFixture: Map<
    string | symbol,
    Newable<ErrorFilter>
  >;
  let loggerMock: Mocked<Logger>;

  beforeAll(() => {
    loggerMock = {
      warn: vitest.fn(),
    } as unknown as Mocked<Logger>;
  });

  describe('when called', () => {
    let errorTypeToGlobalErrorFilterMapFixture: Map<
      Newable<Error> | null,
      Newable<ErrorFilter>
    >;
    let errorFilterFixture: Newable<ErrorFilter>;
    let errorTypesFixture: Set<Newable<Error> | null>;

    beforeAll(() => {
      errorDiscriminatorToErrorFilterMapFixture = new Map();
      errorTypeToGlobalErrorFilterMapFixture = new Map();
      errorFilterFixture = class TestErrorFilter {} as Newable<ErrorFilter>;
      errorTypesFixture = new Set([Error, null]);

      vitest
        .mocked(getCatchErrorMetadata)
        .mockReturnValueOnce(errorTypesFixture);

      setErrorFilterToErrorFilterMap(
        loggerMock,
        errorDiscriminatorToErrorFilterMapFixture,
        errorTypeToGlobalErrorFilterMapFixture,
        errorFilterFixture,
      );
    });

    it('should call getCatchErrorMetadata()', () => {
      expect(getCatchErrorMetadata).toHaveBeenCalledExactlyOnceWith(
        errorFilterFixture,
      );
    });

    it('should set error filters', () => {
      expect(errorTypeToGlobalErrorFilterMapFixture.get(Error)).toBe(
        errorFilterFixture,
      );
      expect(errorTypeToGlobalErrorFilterMapFixture.get(null)).toBe(
        errorFilterFixture,
      );
    });
  });

  describe('when called, and getCatchErrorMetadata() returns Set with existing Newable<Error>', () => {
    let errorTypeToGlobalErrorFilterMapFixture: Map<
      Newable<Error> | null,
      Newable<ErrorFilter>
    >;
    let errorFilterFixture: Newable<ErrorFilter>;
    let existingErrorFilterFixture: Newable<ErrorFilter>;
    let errorTypesFixture: Set<Newable<Error> | null>;
    let loggerFixture: Mocked<Logger>;

    beforeAll(() => {
      loggerFixture = {
        warn: vitest.fn(),
      } as unknown as Mocked<Logger>;
      errorDiscriminatorToErrorFilterMapFixture = new Map();
      errorTypeToGlobalErrorFilterMapFixture = new Map();
      existingErrorFilterFixture =
        class ExistingErrorFilter {} as Newable<ErrorFilter>;
      errorFilterFixture = class TestErrorFilter {} as Newable<ErrorFilter>;
      errorTypesFixture = new Set([Error]);

      errorTypeToGlobalErrorFilterMapFixture.set(
        Error,
        existingErrorFilterFixture,
      );

      vitest
        .mocked(getCatchErrorMetadata)
        .mockReturnValueOnce(errorTypesFixture);

      setErrorFilterToErrorFilterMap(
        loggerFixture,
        errorDiscriminatorToErrorFilterMapFixture,
        errorTypeToGlobalErrorFilterMapFixture,
        errorFilterFixture,
      );
    });

    it('should override error filters', () => {
      expect(errorTypeToGlobalErrorFilterMapFixture.get(Error)).toBe(
        errorFilterFixture,
      );
    });

    it('should warn about the override', () => {
      expect(loggerFixture.warn).toHaveBeenCalledExactlyOnceWith(
        "Error filter 'TestErrorFilter' overrides the error filter already registered for error type 'Error'.",
      );
    });
  });

  describe('when called, and getCatchErrorMetadata() returns Set with Newable<Error> already registered with the same error filter', () => {
    let errorTypeToGlobalErrorFilterMapFixture: Map<
      Newable<Error> | null,
      Newable<ErrorFilter>
    >;
    let errorFilterFixture: Newable<ErrorFilter>;
    let errorTypesFixture: Set<Newable<Error> | null>;
    let loggerFixture: Mocked<Logger>;

    beforeAll(() => {
      loggerFixture = {
        warn: vitest.fn(),
      } as unknown as Mocked<Logger>;
      errorDiscriminatorToErrorFilterMapFixture = new Map();
      errorTypeToGlobalErrorFilterMapFixture = new Map();
      errorFilterFixture = class TestErrorFilter {} as Newable<ErrorFilter>;
      errorTypesFixture = new Set([Error]);

      errorTypeToGlobalErrorFilterMapFixture.set(Error, errorFilterFixture);

      vitest
        .mocked(getCatchErrorMetadata)
        .mockReturnValueOnce(errorTypesFixture);

      setErrorFilterToErrorFilterMap(
        loggerFixture,
        errorDiscriminatorToErrorFilterMapFixture,
        errorTypeToGlobalErrorFilterMapFixture,
        errorFilterFixture,
      );
    });

    it('should keep the error filter', () => {
      expect(errorTypeToGlobalErrorFilterMapFixture.get(Error)).toBe(
        errorFilterFixture,
      );
    });

    it('should not warn', () => {
      expect(loggerFixture.warn).not.toHaveBeenCalled();
    });
  });

  describe('when called, and getCatchErrorMetadata() returns Set with existing null', () => {
    let errorTypeToGlobalErrorFilterMapFixture: Map<
      Newable<Error> | null,
      Newable<ErrorFilter>
    >;
    let errorFilterFixture: Newable<ErrorFilter>;
    let existingErrorFilterFixture: Newable<ErrorFilter>;
    let errorTypesFixture: Set<Newable<Error> | null>;
    let loggerFixture: Mocked<Logger>;

    beforeAll(() => {
      loggerFixture = {
        warn: vitest.fn(),
      } as unknown as Mocked<Logger>;
      errorDiscriminatorToErrorFilterMapFixture = new Map();
      errorTypeToGlobalErrorFilterMapFixture = new Map();
      existingErrorFilterFixture =
        class ExistingErrorFilter {} as Newable<ErrorFilter>;
      errorFilterFixture = class TestErrorFilter {} as Newable<ErrorFilter>;
      errorTypesFixture = new Set([null]);

      errorTypeToGlobalErrorFilterMapFixture.set(
        null,
        existingErrorFilterFixture,
      );

      vitest
        .mocked(getCatchErrorMetadata)
        .mockReturnValueOnce(errorTypesFixture);

      setErrorFilterToErrorFilterMap(
        loggerFixture,
        errorDiscriminatorToErrorFilterMapFixture,
        errorTypeToGlobalErrorFilterMapFixture,
        errorFilterFixture,
      );
    });

    it('should override error filters', () => {
      expect(errorTypeToGlobalErrorFilterMapFixture.get(null)).toBe(
        errorFilterFixture,
      );
    });

    it('should warn about the override', () => {
      expect(loggerFixture.warn).toHaveBeenCalledExactlyOnceWith(
        "Error filter 'TestErrorFilter' overrides the error filter already registered for error type 'null (catch-all)'.",
      );
    });
  });

  describe('when called, and getCatchErrorMetadata() returns Set with both existing and unexisting Newable<Error>', () => {
    let errorTypeToGlobalErrorFilterMapFixture: Map<
      Newable<Error> | null,
      Newable<ErrorFilter>
    >;
    let errorFilterFixture: Newable<ErrorFilter>;
    let existingErrorFilterFixture: Newable<ErrorFilter>;
    let errorTypesFixture: Set<Newable<Error> | null>;
    let customErrorFixture: Newable<Error>;
    let loggerFixture: Mocked<Logger>;

    beforeAll(() => {
      loggerFixture = {
        warn: vitest.fn(),
      } as unknown as Mocked<Logger>;
      errorDiscriminatorToErrorFilterMapFixture = new Map();
      errorTypeToGlobalErrorFilterMapFixture = new Map();
      existingErrorFilterFixture =
        class ExistingErrorFilter {} as Newable<ErrorFilter>;
      errorFilterFixture = class TestErrorFilter {} as Newable<ErrorFilter>;
      customErrorFixture = class CustomError extends Error {};
      errorTypesFixture = new Set([Error, customErrorFixture]);

      errorTypeToGlobalErrorFilterMapFixture.set(
        Error,
        existingErrorFilterFixture,
      );

      vitest
        .mocked(getCatchErrorMetadata)
        .mockReturnValueOnce(errorTypesFixture);

      setErrorFilterToErrorFilterMap(
        loggerFixture,
        errorDiscriminatorToErrorFilterMapFixture,
        errorTypeToGlobalErrorFilterMapFixture,
        errorFilterFixture,
      );
    });

    it('should override existing error filter for Error', () => {
      expect(errorTypeToGlobalErrorFilterMapFixture.get(Error)).toBe(
        errorFilterFixture,
      );
    });

    it('should set new error filter for CustomError', () => {
      expect(
        errorTypeToGlobalErrorFilterMapFixture.get(customErrorFixture),
      ).toBe(errorFilterFixture);
    });

    it('should warn only about the overridden error type', () => {
      expect(loggerFixture.warn).toHaveBeenCalledExactlyOnceWith(
        "Error filter 'TestErrorFilter' overrides the error filter already registered for error type 'Error'.",
      );
    });
  });

  describe('having an error type with discriminator metadata', () => {
    describe('when called', () => {
      let errorTypeToGlobalErrorFilterMapFixture: Map<
        Newable<Error> | null,
        Newable<ErrorFilter>
      >;
      let errorFilterFixture: Newable<ErrorFilter>;
      let customErrorFixture: Newable<Error>;
      let errorTypesFixture: Set<Newable<Error> | null>;

      beforeAll(() => {
        errorDiscriminatorToErrorFilterMapFixture = new Map();
        errorTypeToGlobalErrorFilterMapFixture = new Map();
        errorFilterFixture = class TestErrorFilter {} as Newable<ErrorFilter>;
        customErrorFixture = class DiscriminatedError extends Error {};
        errorTypesFixture = new Set([customErrorFixture]);

        vitest
          .mocked(getCatchErrorMetadata)
          .mockReturnValueOnce(errorTypesFixture);

        vitest
          .mocked(getErrorDiscriminatorMetadata)
          .mockReturnValueOnce(['custom-discriminator-key']);

        setErrorFilterToErrorFilterMap(
          loggerMock,
          errorDiscriminatorToErrorFilterMapFixture,
          errorTypeToGlobalErrorFilterMapFixture,
          errorFilterFixture,
        );
      });

      it('should register error filter in the type and discriminator maps', () => {
        expect(
          errorTypeToGlobalErrorFilterMapFixture.get(customErrorFixture),
        ).toBe(errorFilterFixture);
        expect(
          errorDiscriminatorToErrorFilterMapFixture.get(
            'custom-discriminator-key',
          ),
        ).toBe(errorFilterFixture);
      });

      it('should not warn', () => {
        expect(loggerMock.warn).not.toHaveBeenCalled();
      });
    });
  });

  describe('having an error type with discriminator metadata already registered', () => {
    describe('when called', () => {
      let errorTypeToGlobalErrorFilterMapFixture: Map<
        Newable<Error> | null,
        Newable<ErrorFilter>
      >;
      let errorFilterFixture: Newable<ErrorFilter>;
      let existingErrorFilterFixture: Newable<ErrorFilter>;
      let customErrorFixture: Newable<Error>;
      let errorTypesFixture: Set<Newable<Error> | null>;

      beforeAll(() => {
        errorDiscriminatorToErrorFilterMapFixture = new Map();
        errorTypeToGlobalErrorFilterMapFixture = new Map();
        existingErrorFilterFixture =
          class ExistingErrorFilter {} as Newable<ErrorFilter>;
        errorFilterFixture = class TestErrorFilter {} as Newable<ErrorFilter>;
        customErrorFixture = class DiscriminatedError extends Error {};
        errorTypesFixture = new Set([customErrorFixture]);

        errorDiscriminatorToErrorFilterMapFixture.set(
          'custom-discriminator-key',
          existingErrorFilterFixture,
        );

        vitest
          .mocked(getCatchErrorMetadata)
          .mockReturnValueOnce(errorTypesFixture);

        vitest
          .mocked(getErrorDiscriminatorMetadata)
          .mockReturnValueOnce(['custom-discriminator-key']);

        setErrorFilterToErrorFilterMap(
          loggerMock,
          errorDiscriminatorToErrorFilterMapFixture,
          errorTypeToGlobalErrorFilterMapFixture,
          errorFilterFixture,
        );
      });

      it('should override the discriminator error filter', () => {
        expect(
          errorDiscriminatorToErrorFilterMapFixture.get(
            'custom-discriminator-key',
          ),
        ).toBe(errorFilterFixture);
      });

      it('should not warn', () => {
        expect(loggerMock.warn).not.toHaveBeenCalled();
      });
    });
  });
});
