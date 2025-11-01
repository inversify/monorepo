import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/framework-core');
vitest.mock('../../http/actions/setErrorFilterToErrorFilterMap');

import {
  ErrorFilter,
  getClassErrorFilterMetadata,
  getClassMethodErrorFilterMetadata,
} from '@inversifyjs/framework-core';
import { Logger } from '@inversifyjs/logger';
import { Newable } from 'inversify';

import { setErrorFilterToErrorFilterMap } from '../../http/actions/setErrorFilterToErrorFilterMap';
import { buildErrorTypeToErrorFilterMap } from './buildErrorTypeToErrorFilterMap';

describe(buildErrorTypeToErrorFilterMap, () => {
  let targetFixture: NewableFunction;
  let methodKeyFixture: string;
  let loggerFixture: Logger;

  beforeAll(() => {
    targetFixture = class TestController {};
    methodKeyFixture = 'testMethod';
    loggerFixture = Symbol() as unknown as Logger;
  });

  describe('when called', () => {
    let methodErrorFilterSetFixture: Set<Newable<ErrorFilter>>;
    let classErrorFilterSetFixture: Set<Newable<ErrorFilter>>;
    let methodErrorFilter1Fixture: Newable<ErrorFilter>;
    let methodErrorFilter2Fixture: Newable<ErrorFilter>;
    let classErrorFilter1Fixture: Newable<ErrorFilter>;
    let classErrorFilter2Fixture: Newable<ErrorFilter>;
    let result: unknown;

    beforeAll(() => {
      methodErrorFilter1Fixture =
        class MethodErrorFilter1 {} as Newable<ErrorFilter>;
      methodErrorFilter2Fixture =
        class MethodErrorFilter2 {} as Newable<ErrorFilter>;
      classErrorFilter1Fixture =
        class ClassErrorFilter1 {} as Newable<ErrorFilter>;
      classErrorFilter2Fixture =
        class ClassErrorFilter2 {} as Newable<ErrorFilter>;
      methodErrorFilterSetFixture = new Set([
        methodErrorFilter1Fixture,
        methodErrorFilter2Fixture,
      ]);
      classErrorFilterSetFixture = new Set([
        classErrorFilter1Fixture,
        classErrorFilter2Fixture,
      ]);

      vitest
        .mocked(getClassMethodErrorFilterMetadata)
        .mockReturnValueOnce(methodErrorFilterSetFixture);

      vitest
        .mocked(getClassErrorFilterMetadata)
        .mockReturnValueOnce(classErrorFilterSetFixture);

      result = buildErrorTypeToErrorFilterMap(
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

    it('should call setErrorFilterToErrorFilterMap()', () => {
      expect(setErrorFilterToErrorFilterMap).toHaveBeenCalledTimes(4);
      expect(setErrorFilterToErrorFilterMap).toHaveBeenNthCalledWith(
        1,
        loggerFixture,
        expect.any(Map),
        methodErrorFilter1Fixture,
      );
      expect(setErrorFilterToErrorFilterMap).toHaveBeenNthCalledWith(
        2,
        loggerFixture,
        expect.any(Map),
        methodErrorFilter2Fixture,
      );
      expect(setErrorFilterToErrorFilterMap).toHaveBeenNthCalledWith(
        3,
        loggerFixture,
        expect.any(Map),
        classErrorFilter1Fixture,
      );
      expect(setErrorFilterToErrorFilterMap).toHaveBeenNthCalledWith(
        4,
        loggerFixture,
        expect.any(Map),
        classErrorFilter2Fixture,
      );
    });

    it('should return a Map<Newable<Error> | null, Newable<ErrorFilter>>', () => {
      expect(result).toBeInstanceOf(Map);
    });
  });

  describe('when called, and getClassMethodErrorFilterMetadata() returns an empty Set', () => {
    let methodErrorFilterSetFixture: Set<Newable<ErrorFilter>>;
    let classErrorFilterSetFixture: Set<Newable<ErrorFilter>>;
    let classErrorFilter1Fixture: Newable<ErrorFilter>;
    let result: unknown;

    beforeAll(() => {
      methodErrorFilterSetFixture = new Set();
      classErrorFilter1Fixture =
        class ClassErrorFilter1 {} as Newable<ErrorFilter>;
      classErrorFilterSetFixture = new Set([classErrorFilter1Fixture]);

      vitest
        .mocked(getClassMethodErrorFilterMetadata)
        .mockReturnValueOnce(methodErrorFilterSetFixture);

      vitest
        .mocked(getClassErrorFilterMetadata)
        .mockReturnValueOnce(classErrorFilterSetFixture);

      result = buildErrorTypeToErrorFilterMap(
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

    it('should call setErrorFilterToErrorFilterMap() for class filters only', () => {
      expect(setErrorFilterToErrorFilterMap).toHaveBeenCalledExactlyOnceWith(
        loggerFixture,
        expect.any(Map),
        classErrorFilter1Fixture,
      );
    });

    it('should return a Map<Newable<Error> | null, Newable<ErrorFilter>>', () => {
      expect(result).toBeInstanceOf(Map);
    });
  });

  describe('when called, and both getClassMethodErrorFilterMetadata() and getClassErrorFilterMetadata() return empty Sets', () => {
    let methodErrorFilterSetFixture: Set<Newable<ErrorFilter>>;
    let classErrorFilterSetFixture: Set<Newable<ErrorFilter>>;
    let result: unknown;

    beforeAll(() => {
      methodErrorFilterSetFixture = new Set();
      classErrorFilterSetFixture = new Set();

      vitest
        .mocked(getClassMethodErrorFilterMetadata)
        .mockReturnValueOnce(methodErrorFilterSetFixture);

      vitest
        .mocked(getClassErrorFilterMetadata)
        .mockReturnValueOnce(classErrorFilterSetFixture);

      result = buildErrorTypeToErrorFilterMap(
        loggerFixture,
        targetFixture,
        methodKeyFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call setErrorFilterToErrorFilterMap()', () => {
      expect(setErrorFilterToErrorFilterMap).not.toHaveBeenCalled();
    });

    it('should return an empty Map', () => {
      expect(result).toBeInstanceOf(Map);
      expect((result as Map<unknown, unknown>).size).toBe(0);
    });
  });
});
