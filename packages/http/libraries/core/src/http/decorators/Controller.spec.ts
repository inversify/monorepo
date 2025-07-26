import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');
vitest.mock('inversify');
vitest.mock('../calculations/buildArrayMetadataWithElement');

import {
  buildArrayMetadataWithElement,
  buildDefaultArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { injectable } from 'inversify';

import { controllerMetadataReflectKey } from '../../reflectMetadata/data/controllerMetadataReflectKey';
import { ControllerOptions } from '../models/ControllerOptions';
import { Controller } from './Controller';

describe(Controller, () => {
  describe('having a path', () => {
    describe('when called', () => {
      let pathFixture: string;
      let targetFixture: NewableFunction;
      let classDecoratorMock: Mock<ClassDecorator>;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        pathFixture = '/api';
        targetFixture = class TestController {};
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        classDecoratorMock = vitest.fn();

        vitest
          .mocked(buildArrayMetadataWithElement)
          .mockReturnValueOnce(callbackFixture);

        vitest
          .mocked(injectable)
          .mockReturnValueOnce(classDecoratorMock as ClassDecorator);

        Controller(pathFixture)(targetFixture);
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

      it('should call buildArrayMetadataWithElement', () => {
        expect(buildArrayMetadataWithElement).toHaveBeenCalledTimes(1);
        expect(buildArrayMetadataWithElement).toHaveBeenCalledWith({
          path: pathFixture,
          target: targetFixture,
        });
      });

      it('should set metadata with controller path', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          Reflect,
          controllerMetadataReflectKey,
          buildDefaultArrayMetadata,
          callbackFixture,
        );
      });
    });
  });

  describe('having a ControllerOptions', () => {
    describe('when called and scope is undefined', () => {
      let optionsFixture: { controllerName: string; path: string };
      let targetFixture: NewableFunction;
      let classDecoratorMock: Mock<ClassDecorator>;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        optionsFixture = {
          controllerName: 'TestController',
          path: '/api',
        };
        targetFixture = class TestController {};
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithElement)
          .mockReturnValueOnce(callbackFixture);

        classDecoratorMock = vitest.fn();

        vitest
          .mocked(injectable)
          .mockReturnValueOnce(classDecoratorMock as ClassDecorator);

        Controller(optionsFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildArrayMetadataWithElement', () => {
        expect(buildArrayMetadataWithElement).toHaveBeenCalledTimes(1);
        expect(buildArrayMetadataWithElement).toHaveBeenCalledWith({
          path: optionsFixture.path,
          target: targetFixture,
        });
      });

      it('should set metadata with controller options', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          Reflect,
          controllerMetadataReflectKey,
          buildDefaultArrayMetadata,
          callbackFixture,
        );
      });
    });

    describe('when called and scope is defined', () => {
      let optionsFixture: ControllerOptions;
      let targetFixture: NewableFunction;
      let classDecoratorMock: Mock<ClassDecorator>;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        optionsFixture = {
          path: '/api',
          scope: 'Singleton',
        };
        targetFixture = class TestController {};
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithElement)
          .mockReturnValueOnce(callbackFixture);

        classDecoratorMock = vitest.fn();

        vitest
          .mocked(injectable)
          .mockReturnValueOnce(classDecoratorMock as ClassDecorator);

        Controller(optionsFixture)(targetFixture);
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

      it('should call buildArrayMetadataWithElement', () => {
        expect(buildArrayMetadataWithElement).toHaveBeenCalledTimes(1);
        expect(buildArrayMetadataWithElement).toHaveBeenCalledWith({
          path: optionsFixture.path,
          target: targetFixture,
        });
      });

      it('should set metadata with controller options', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          Reflect,
          controllerMetadataReflectKey,
          buildDefaultArrayMetadata,
          callbackFixture,
        );
      });
    });
  });
});
