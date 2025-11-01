import { beforeAll, describe, expect, it, Mocked, vitest } from 'vitest';

vitest.mock('@inversifyjs/framework-core');

import {
  ErrorFilter,
  getCatchErrorMetadata,
} from '@inversifyjs/framework-core';
import { Logger } from '@inversifyjs/logger';
import { Newable } from 'inversify';

import { setErrorFilterToErrorFilterMap } from './setErrorFilterToErrorFilterMap';

describe(setErrorFilterToErrorFilterMap, () => {
  let loggerMock: Mocked<Logger>;

  beforeAll(() => {
    loggerMock = {
      warn: vitest.fn(),
    } as Partial<Mocked<Logger>> as Mocked<Logger>;
  });

  describe('when called', () => {
    let errorTypeToGlobalErrorFilterMapFixture: Map<
      Newable<Error> | null,
      Newable<ErrorFilter>
    >;
    let errorFilterFixture: Newable<ErrorFilter>;
    let errorTypesFixture: Set<Newable<Error> | null>;

    beforeAll(() => {
      errorTypeToGlobalErrorFilterMapFixture = new Map();
      errorFilterFixture = class TestErrorFilter {} as Newable<ErrorFilter>;
      errorTypesFixture = new Set([Error, null]);

      vitest
        .mocked(getCatchErrorMetadata)
        .mockReturnValueOnce(errorTypesFixture);

      setErrorFilterToErrorFilterMap(
        loggerMock,
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

    beforeAll(() => {
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
        loggerMock,
        errorTypeToGlobalErrorFilterMapFixture,
        errorFilterFixture,
      );
    });

    it('should not override error filters', () => {
      expect(errorTypeToGlobalErrorFilterMapFixture.get(Error)).toBe(
        existingErrorFilterFixture,
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

    beforeAll(() => {
      errorTypeToGlobalErrorFilterMapFixture = new Map();
      existingErrorFilterFixture =
        class ExistingErrorFilter {} as Newable<ErrorFilter>;
      errorFilterFixture = class TestErrorFilter {} as Newable<ErrorFilter>;
      customErrorFixture = class CustomError extends Error {} as Newable<Error>;
      errorTypesFixture = new Set([Error, customErrorFixture]);

      errorTypeToGlobalErrorFilterMapFixture.set(
        Error,
        existingErrorFilterFixture,
      );

      vitest
        .mocked(getCatchErrorMetadata)
        .mockReturnValueOnce(errorTypesFixture);

      setErrorFilterToErrorFilterMap(
        loggerMock,
        errorTypeToGlobalErrorFilterMapFixture,
        errorFilterFixture,
      );
    });

    it('should not override existing error filter for Error', () => {
      expect(errorTypeToGlobalErrorFilterMapFixture.get(Error)).toBe(
        existingErrorFilterFixture,
      );
    });

    it('should set new error filter for CustomError', () => {
      expect(
        errorTypeToGlobalErrorFilterMapFixture.get(customErrorFixture),
      ).toBe(errorFilterFixture);
    });
  });
});
