import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

vitest.mock('../calculations/buildCatchErrorMetadata');
vitest.mock('@inversifyjs/reflect-metadata-utils');
vitest.mock('inversify');

import {
  buildEmptyMapMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { injectable, Newable } from 'inversify';

import { catchErrorMetadataReflectKey } from '../../reflectMetadata/data/catchErrorMetadataReflectKey';
import { buildCatchErrorMetadata } from '../calculations/buildCatchErrorMetadata';
import { CatchErrorOptions } from '../models/CatchErrorOptions';
import { CatchError } from './CatchError';

class TestError extends Error {}

describe(CatchError, () => {
  describe('having a path', () => {
    describe('when called', () => {
      let errorFixture: Newable<Error>;
      let targetFixture: NewableFunction;
      let classDecoratorMock: Mock<ClassDecorator>;
      let callbackFixture: (
        mapMetadata: Map<Newable<Error> | null, NewableFunction[]>,
      ) => Map<Newable<Error> | null, NewableFunction[]>;

      beforeAll(() => {
        errorFixture = TestError;
        targetFixture = class TestCatchError {};
        callbackFixture = (
          mapMetadata: Map<Newable<Error> | null, NewableFunction[]>,
        ): Map<Newable<Error> | null, NewableFunction[]> => mapMetadata;

        classDecoratorMock = vitest.fn();

        vitest
          .mocked(buildCatchErrorMetadata)
          .mockReturnValueOnce(callbackFixture);

        vitest
          .mocked(injectable)
          .mockReturnValueOnce(classDecoratorMock as ClassDecorator);

        CatchError(errorFixture)(targetFixture);
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

      it('should call buildCatchErrorMetadata', () => {
        expect(buildCatchErrorMetadata).toHaveBeenCalledTimes(1);
        expect(buildCatchErrorMetadata).toHaveBeenCalledWith(
          errorFixture,
          targetFixture,
        );
      });

      it('should set metadata with error filter', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          Reflect,
          catchErrorMetadataReflectKey,
          buildEmptyMapMetadata,
          callbackFixture,
        );
      });
    });
  });

  describe('having a CatchErrorOptions', () => {
    describe('when called and scope is undefined', () => {
      let optionsFixture: CatchErrorOptions;
      let targetFixture: NewableFunction;
      let classDecoratorMock: Mock<ClassDecorator>;
      let callbackFixture: (
        mapMetadata: Map<Newable<Error> | null, NewableFunction[]>,
      ) => Map<Newable<Error> | null, NewableFunction[]>;

      beforeAll(() => {
        optionsFixture = {
          error: TestError,
        };
        targetFixture = class TestCatchError {};
        callbackFixture = (
          mapMetadata: Map<Newable<Error> | null, NewableFunction[]>,
        ): Map<Newable<Error> | null, NewableFunction[]> => mapMetadata;

        vitest
          .mocked(buildCatchErrorMetadata)
          .mockReturnValueOnce(callbackFixture);

        classDecoratorMock = vitest.fn();

        vitest
          .mocked(injectable)
          .mockReturnValueOnce(classDecoratorMock as ClassDecorator);

        CatchError(optionsFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildCatchErrorMetadata', () => {
        expect(buildCatchErrorMetadata).toHaveBeenCalledTimes(1);
        expect(buildCatchErrorMetadata).toHaveBeenCalledWith(
          optionsFixture.error,
          targetFixture,
        );
      });

      it('should set metadata with controller options', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          Reflect,
          catchErrorMetadataReflectKey,
          buildEmptyMapMetadata,
          callbackFixture,
        );
      });
    });

    describe('when called and scope is defined', () => {
      let optionsFixture: CatchErrorOptions;
      let targetFixture: NewableFunction;
      let classDecoratorMock: Mock<ClassDecorator>;
      let callbackFixture: (
        mapMetadata: Map<Newable<Error> | null, NewableFunction[]>,
      ) => Map<Newable<Error> | null, NewableFunction[]>;

      beforeAll(() => {
        optionsFixture = {
          error: TestError,
          scope: 'Singleton',
        };
        targetFixture = class TestController {};
        callbackFixture = (
          mapMetadata: Map<Newable<Error> | null, NewableFunction[]>,
        ): Map<Newable<Error> | null, NewableFunction[]> => mapMetadata;

        vitest
          .mocked(buildCatchErrorMetadata)
          .mockReturnValueOnce(callbackFixture);

        classDecoratorMock = vitest.fn();

        vitest
          .mocked(injectable)
          .mockReturnValueOnce(classDecoratorMock as ClassDecorator);

        CatchError(optionsFixture)(targetFixture);
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

      it('should call buildCatchErrorMetadata', () => {
        expect(buildCatchErrorMetadata).toHaveBeenCalledTimes(1);
        expect(buildCatchErrorMetadata).toHaveBeenCalledWith(
          optionsFixture.error,
          targetFixture,
        );
      });

      it('should set metadata with controller options', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          Reflect,
          catchErrorMetadataReflectKey,
          buildEmptyMapMetadata,
          callbackFixture,
        );
      });
    });
  });
});
