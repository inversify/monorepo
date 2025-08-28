import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

vitest.mock('../calculations/buildCatchExceptionMetadata');
vitest.mock('@inversifyjs/reflect-metadata-utils');
vitest.mock('inversify');

import {
  buildEmptyMapMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { injectable, Newable } from 'inversify';

import { catchExceptionMetadataReflectKey } from '../../reflectMetadata/data/catchExceptionMetadataReflectKey';
import { buildCatchExceptionMetadata } from '../calculations/buildCatchExceptionMetadata';
import { CatchExceptionOptions } from '../models/CatchExceptionOptions';
import { CatchException } from './CatchException';

class TestError extends Error {}

describe(CatchException, () => {
  describe('having a path', () => {
    describe('when called', () => {
      let errorFixture: Newable<Error>;
      let targetFixture: NewableFunction;
      let classDecoratorMock: Mock<ClassDecorator>;
      let callbackFixture: (
        mapMetadata: Map<Newable<Error>, NewableFunction[]>,
      ) => Map<Newable<Error>, NewableFunction[]>;

      beforeAll(() => {
        errorFixture = TestError;
        targetFixture = class TestCatchException {};
        callbackFixture = (
          mapMetadata: Map<Newable<Error>, NewableFunction[]>,
        ): Map<Newable<Error>, NewableFunction[]> => mapMetadata;

        classDecoratorMock = vitest.fn();

        vitest
          .mocked(buildCatchExceptionMetadata)
          .mockReturnValueOnce(callbackFixture);

        vitest
          .mocked(injectable)
          .mockReturnValueOnce(classDecoratorMock as ClassDecorator);

        CatchException(errorFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call injectable', () => {
        expect(injectable).toHaveBeenCalledWith(undefined);
      });

      it('should call ClassDecorator', () => {
        expect(classDecoratorMock).toHaveBeenCalledWith(targetFixture);
      });

      it('should call buildCatchExceptionMetadata', () => {
        expect(buildCatchExceptionMetadata).toHaveBeenCalledTimes(1);
        expect(buildCatchExceptionMetadata).toHaveBeenCalledWith(
          errorFixture,
          targetFixture,
        );
      });

      it('should set metadata with error filter', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          Reflect,
          catchExceptionMetadataReflectKey,
          buildEmptyMapMetadata,
          callbackFixture,
        );
      });
    });
  });

  describe('having a CatchExceptionOptions', () => {
    describe('when called and scope is undefined', () => {
      let optionsFixture: CatchExceptionOptions;
      let targetFixture: NewableFunction;
      let classDecoratorMock: Mock<ClassDecorator>;
      let callbackFixture: (
        mapMetadata: Map<Newable<Error>, NewableFunction[]>,
      ) => Map<Newable<Error>, NewableFunction[]>;

      beforeAll(() => {
        optionsFixture = {
          error: TestError,
        };
        targetFixture = class TestCatchException {};
        callbackFixture = (
          mapMetadata: Map<Newable<Error>, NewableFunction[]>,
        ): Map<Newable<Error>, NewableFunction[]> => mapMetadata;

        vitest
          .mocked(buildCatchExceptionMetadata)
          .mockReturnValueOnce(callbackFixture);

        classDecoratorMock = vitest.fn();

        vitest
          .mocked(injectable)
          .mockReturnValueOnce(classDecoratorMock as ClassDecorator);

        CatchException(optionsFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildCatchExceptionMetadata', () => {
        expect(buildCatchExceptionMetadata).toHaveBeenCalledTimes(1);
        expect(buildCatchExceptionMetadata).toHaveBeenCalledWith(
          optionsFixture.error,
          targetFixture,
        );
      });

      it('should set metadata with controller options', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          Reflect,
          catchExceptionMetadataReflectKey,
          buildEmptyMapMetadata,
          callbackFixture,
        );
      });
    });

    describe('when called and scope is defined', () => {
      let optionsFixture: CatchExceptionOptions;
      let targetFixture: NewableFunction;
      let classDecoratorMock: Mock<ClassDecorator>;
      let callbackFixture: (
        mapMetadata: Map<Newable<Error>, NewableFunction[]>,
      ) => Map<Newable<Error>, NewableFunction[]>;

      beforeAll(() => {
        optionsFixture = {
          error: TestError,
          scope: 'Singleton',
        };
        targetFixture = class TestController {};
        callbackFixture = (
          mapMetadata: Map<Newable<Error>, NewableFunction[]>,
        ): Map<Newable<Error>, NewableFunction[]> => mapMetadata;

        vitest
          .mocked(buildCatchExceptionMetadata)
          .mockReturnValueOnce(callbackFixture);

        classDecoratorMock = vitest.fn();

        vitest
          .mocked(injectable)
          .mockReturnValueOnce(classDecoratorMock as ClassDecorator);

        CatchException(optionsFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call injectable', () => {
        expect(injectable).toHaveBeenCalledWith(optionsFixture.scope);
      });

      it('should call ClassDecorator', () => {
        expect(classDecoratorMock).toHaveBeenCalledWith(targetFixture);
      });

      it('should call buildCatchExceptionMetadata', () => {
        expect(buildCatchExceptionMetadata).toHaveBeenCalledTimes(1);
        expect(buildCatchExceptionMetadata).toHaveBeenCalledWith(
          optionsFixture.error,
          targetFixture,
        );
      });

      it('should set metadata with controller options', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          Reflect,
          catchExceptionMetadataReflectKey,
          buildEmptyMapMetadata,
          callbackFixture,
        );
      });
    });
  });
});
