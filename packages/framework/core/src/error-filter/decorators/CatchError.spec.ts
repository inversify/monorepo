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
  buildEmptySetMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { injectable, Newable } from 'inversify';

import { catchErrorMetadataReflectKey } from '../../reflectMetadata/data/catchErrorMetadataReflectKey';
import { buildCatchErrorMetadata } from '../calculations/buildCatchErrorMetadata';
import { CatchErrorOptions } from '../models/CatchErrorOptions';
import { CatchError } from './CatchError';

class TestError extends Error {}

describe(CatchError, () => {
  describe('having an error type', () => {
    describe('when called', () => {
      let errorFixture: Newable<Error>;
      let targetFixture: NewableFunction;
      let classDecoratorMock: Mock<ClassDecorator>;
      let callbackFixture: (
        setMetadata: Set<Newable<Error> | null>,
      ) => Set<Newable<Error> | null>;

      beforeAll(() => {
        errorFixture = TestError;
        targetFixture = class TestCatchError {};
        callbackFixture = (
          setMetadata: Set<Newable<Error> | null>,
        ): Set<Newable<Error> | null> => setMetadata;

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
        expect(injectable).toHaveBeenCalledExactlyOnceWith(undefined);
      });

      it('should call ClassDecorator', () => {
        expect(classDecoratorMock).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
        );
      });

      it('should call buildCatchErrorMetadata', () => {
        expect(buildCatchErrorMetadata).toHaveBeenCalledExactlyOnceWith(
          errorFixture,
        );
      });

      it('should set metadata with error filter', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          catchErrorMetadataReflectKey,
          buildEmptySetMetadata,
          callbackFixture,
        );
      });
    });
  });

  describe('having a CatchErrorOptions', () => {
    describe('when called, and scope is undefined', () => {
      let optionsFixture: CatchErrorOptions;
      let targetFixture: NewableFunction;
      let classDecoratorMock: Mock<ClassDecorator>;
      let callbackFixture: (
        setMetadata: Set<Newable<Error> | null>,
      ) => Set<Newable<Error> | null>;

      beforeAll(() => {
        optionsFixture = {
          error: TestError,
        };
        targetFixture = class TestCatchError {};
        callbackFixture = (
          setMetadata: Set<Newable<Error> | null>,
        ): Set<Newable<Error> | null> => setMetadata;

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
        expect(buildCatchErrorMetadata).toHaveBeenCalledExactlyOnceWith(
          optionsFixture.error,
        );
      });

      it('should set metadata with controller options', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          catchErrorMetadataReflectKey,
          buildEmptySetMetadata,
          callbackFixture,
        );
      });
    });

    describe('when called, and scope is defined', () => {
      let optionsFixture: CatchErrorOptions;
      let targetFixture: NewableFunction;
      let classDecoratorMock: Mock<ClassDecorator>;
      let callbackFixture: (
        setMetadata: Set<Newable<Error> | null>,
      ) => Set<Newable<Error> | null>;

      beforeAll(() => {
        optionsFixture = {
          error: TestError,
          scope: 'Singleton',
        };
        targetFixture = class TestController {};
        callbackFixture = (
          setMetadata: Set<Newable<Error> | null>,
        ): Set<Newable<Error> | null> => setMetadata;

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
        expect(injectable).toHaveBeenCalledExactlyOnceWith(
          optionsFixture.scope,
        );
      });

      it('should call ClassDecorator', () => {
        expect(classDecoratorMock).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
        );
      });

      it('should call buildCatchErrorMetadata', () => {
        expect(buildCatchErrorMetadata).toHaveBeenCalledExactlyOnceWith(
          optionsFixture.error,
        );
      });

      it('should set metadata with controller options', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          catchErrorMetadataReflectKey,
          buildEmptySetMetadata,
          callbackFixture,
        );
      });
    });
  });

  describe('having no parameters', () => {
    describe('when called', () => {
      let targetFixture: NewableFunction;
      let classDecoratorMock: Mock<ClassDecorator>;
      let callbackFixture: (
        setMetadata: Set<Newable<Error> | null>,
      ) => Set<Newable<Error> | null>;

      beforeAll(() => {
        targetFixture = class TestCatchError {};
        callbackFixture = (
          setMetadata: Set<Newable<Error> | null>,
        ): Set<Newable<Error> | null> => setMetadata;

        classDecoratorMock = vitest.fn();

        vitest
          .mocked(buildCatchErrorMetadata)
          .mockReturnValueOnce(callbackFixture);

        vitest
          .mocked(injectable)
          .mockReturnValueOnce(classDecoratorMock as ClassDecorator);

        CatchError()(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call injectable', () => {
        expect(injectable).toHaveBeenCalledExactlyOnceWith(undefined);
      });

      it('should call ClassDecorator', () => {
        expect(classDecoratorMock).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
        );
      });

      it('should call buildCatchErrorMetadata', () => {
        expect(buildCatchErrorMetadata).toHaveBeenCalledExactlyOnceWith(null);
      });

      it('should set metadata with error filter', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          catchErrorMetadataReflectKey,
          buildEmptySetMetadata,
          callbackFixture,
        );
      });
    });
  });
});
