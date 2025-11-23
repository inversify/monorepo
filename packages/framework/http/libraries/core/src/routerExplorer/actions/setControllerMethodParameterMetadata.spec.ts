import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import {
  buildArrayMetadataWithIndex,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodParameterMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodParameterMetadataReflectKey';
import { ControllerMethodParameterMetadata } from '../model/ControllerMethodParameterMetadata';
import { setControllerMethodParameterMetadata } from './setControllerMethodParameterMetadata';

describe(setControllerMethodParameterMetadata, () => {
  describe('having a controller method parameter metadata', () => {
    describe('when called', () => {
      let controllerMethodParameterMetadataFixture: ControllerMethodParameterMetadata;
      let controllerConstructorFixture: NewableFunction;
      let methodNameFixture: string;
      let parameterIndexFixture: number;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        controllerMethodParameterMetadataFixture = {
          parameterType: 'query',
          pipeList: [],
        } as ControllerMethodParameterMetadata;
        controllerConstructorFixture = class TestController {};
        methodNameFixture = 'testMethod';
        parameterIndexFixture = 0;
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithIndex)
          .mockReturnValueOnce(callbackFixture);

        setControllerMethodParameterMetadata(
          controllerMethodParameterMetadataFixture,
          controllerConstructorFixture,
          methodNameFixture,
          parameterIndexFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildArrayMetadataWithIndex()', () => {
        expect(buildArrayMetadataWithIndex).toHaveBeenCalledExactlyOnceWith(
          controllerMethodParameterMetadataFixture,
          parameterIndexFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          controllerConstructorFixture,
          controllerMethodParameterMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
          methodNameFixture,
        );
      });
    });
  });

  describe('having a symbol method name', () => {
    describe('when called', () => {
      let controllerMethodParameterMetadataFixture: ControllerMethodParameterMetadata;
      let controllerConstructorFixture: NewableFunction;
      let methodNameFixture: symbol;
      let parameterIndexFixture: number;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        controllerMethodParameterMetadataFixture = {
          parameterType: 'body',
          pipeList: [],
        } as ControllerMethodParameterMetadata;
        controllerConstructorFixture = class TestController {};
        methodNameFixture = Symbol('testMethod');
        parameterIndexFixture = 2;
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithIndex)
          .mockReturnValueOnce(callbackFixture);

        setControllerMethodParameterMetadata(
          controllerMethodParameterMetadataFixture,
          controllerConstructorFixture,
          methodNameFixture,
          parameterIndexFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildArrayMetadataWithIndex()', () => {
        expect(buildArrayMetadataWithIndex).toHaveBeenCalledExactlyOnceWith(
          controllerMethodParameterMetadataFixture,
          parameterIndexFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          controllerConstructorFixture,
          controllerMethodParameterMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
          methodNameFixture,
        );
      });
    });
  });

  describe('having a higher parameter index', () => {
    describe('when called', () => {
      let controllerMethodParameterMetadataFixture: ControllerMethodParameterMetadata;
      let controllerConstructorFixture: NewableFunction;
      let methodNameFixture: string;
      let parameterIndexFixture: number;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        controllerMethodParameterMetadataFixture = {
          parameterType: 'params',
          pipeList: [Symbol()],
        } as ControllerMethodParameterMetadata;
        controllerConstructorFixture = class TestController {};
        methodNameFixture = 'complexMethod';
        parameterIndexFixture = 5;
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithIndex)
          .mockReturnValueOnce(callbackFixture);

        setControllerMethodParameterMetadata(
          controllerMethodParameterMetadataFixture,
          controllerConstructorFixture,
          methodNameFixture,
          parameterIndexFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildArrayMetadataWithIndex()', () => {
        expect(buildArrayMetadataWithIndex).toHaveBeenCalledExactlyOnceWith(
          controllerMethodParameterMetadataFixture,
          parameterIndexFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          controllerConstructorFixture,
          controllerMethodParameterMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
          methodNameFixture,
        );
      });
    });
  });
});
