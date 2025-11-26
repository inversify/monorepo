import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { setReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodUseNativeHandlerMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodUseNativeHandlerMetadataReflectKey';
import { setControllerMethodUseNativeHandlerMetadata } from './setControllerMethodUseNativeHandlerMetadata';

describe(setControllerMethodUseNativeHandlerMetadata, () => {
  describe('having a string method name', () => {
    describe('when called', () => {
      let controllerConstructorFixture: NewableFunction;
      let methodNameFixture: string;

      beforeAll(() => {
        controllerConstructorFixture = class TestController {};
        methodNameFixture = 'testMethod';

        setControllerMethodUseNativeHandlerMetadata(
          controllerConstructorFixture,
          methodNameFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call setReflectMetadata()', () => {
        expect(setReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          controllerConstructorFixture,
          controllerMethodUseNativeHandlerMetadataReflectKey,
          true,
          methodNameFixture,
        );
      });
    });
  });

  describe('having a symbol method name', () => {
    describe('when called', () => {
      let controllerConstructorFixture: NewableFunction;
      let methodNameFixture: symbol;

      beforeAll(() => {
        controllerConstructorFixture = class TestController {};
        methodNameFixture = Symbol('testMethod');

        setControllerMethodUseNativeHandlerMetadata(
          controllerConstructorFixture,
          methodNameFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call setReflectMetadata()', () => {
        expect(setReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          controllerConstructorFixture,
          controllerMethodUseNativeHandlerMetadataReflectKey,
          true,
          methodNameFixture,
        );
      });
    });
  });

  describe('having different controller constructors', () => {
    describe('when called', () => {
      let controllerConstructorFixture: NewableFunction;
      let methodNameFixture: string;

      beforeAll(() => {
        controllerConstructorFixture = class AnotherController {
          public someMethod(): void {
            // Empty method
          }
        };
        methodNameFixture = 'anotherMethod';

        setControllerMethodUseNativeHandlerMetadata(
          controllerConstructorFixture,
          methodNameFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call setReflectMetadata()', () => {
        expect(setReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          controllerConstructorFixture,
          controllerMethodUseNativeHandlerMetadataReflectKey,
          true,
          methodNameFixture,
        );
      });
    });
  });
});
