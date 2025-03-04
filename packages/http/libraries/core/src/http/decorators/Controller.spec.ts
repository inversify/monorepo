import { beforeAll, describe, expect, it, Mock, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');
vitest.mock('inversify');

import {
  getReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { injectable } from 'inversify';

import { controllerMetadataReflectKey } from '../../reflectMetadata/data/controllerMetadataReflectKey';
import { ControllerOptions } from '../models/ControllerOptions';
import { controller } from './Controller';

describe(controller.name, () => {
  describe('having a path', () => {
    describe('when called', () => {
      let pathFixture: string;
      let targetFixture: NewableFunction;
      let classDecoratorMock: Mock<ClassDecorator>;

      beforeAll(() => {
        pathFixture = '/api';
        targetFixture = class TestController {};

        classDecoratorMock = vitest.fn();

        vitest
          .mocked(injectable)
          .mockReturnValueOnce(classDecoratorMock as ClassDecorator);

        controller(pathFixture)(targetFixture);
      });

      it('should get existing metadata', () => {
        expect(getReflectMetadata).toHaveBeenCalledWith(
          Reflect,
          controllerMetadataReflectKey,
        );
      });

      it('should call injectable', () => {
        expect(injectable).toHaveBeenCalledWith(undefined);
      });

      it('should call ClassDecorator', () => {
        expect(classDecoratorMock).toHaveBeenCalledWith(targetFixture);
      });

      it('should set metadata with controller path', () => {
        expect(setReflectMetadata).toHaveBeenCalledWith(
          Reflect,
          controllerMetadataReflectKey,
          [
            {
              path: pathFixture,
              target: targetFixture,
            },
          ],
        );
      });
    });
  });

  describe('having a ControllerOptions', () => {
    describe('when called and scope is undefined', () => {
      let optionsFixture: { controllerName: string; path: string };
      let targetFixture: NewableFunction;
      let classDecoratorMock: Mock<ClassDecorator>;

      beforeAll(() => {
        optionsFixture = {
          controllerName: 'TestController',
          path: '/api',
        };
        targetFixture = class TestController {};

        classDecoratorMock = vitest.fn();

        vitest
          .mocked(injectable)
          .mockReturnValueOnce(classDecoratorMock as ClassDecorator);

        controller(optionsFixture)(targetFixture);
      });

      it('should set metadata with controller options', () => {
        expect(setReflectMetadata).toHaveBeenCalledWith(
          Reflect,
          controllerMetadataReflectKey,
          [
            {
              controllerName: optionsFixture.controllerName,
              path: optionsFixture.path,
              target: targetFixture,
            },
          ],
        );
      });
    });

    describe('when called and scope is defined', () => {
      let optionsFixture: ControllerOptions;
      let targetFixture: NewableFunction;
      let classDecoratorMock: Mock<ClassDecorator>;

      beforeAll(() => {
        optionsFixture = {
          controllerName: 'TestController',
          path: '/api',
          scope: 'Singleton',
        };
        targetFixture = class TestController {};

        classDecoratorMock = vitest.fn();

        vitest
          .mocked(injectable)
          .mockReturnValueOnce(classDecoratorMock as ClassDecorator);

        controller(optionsFixture)(targetFixture);
      });

      it('should call injectable', () => {
        expect(injectable).toHaveBeenCalledWith(optionsFixture.scope);
      });

      it('should call ClassDecorator', () => {
        expect(classDecoratorMock).toHaveBeenCalledWith(targetFixture);
      });

      it('should set metadata with controller options', () => {
        expect(setReflectMetadata).toHaveBeenCalledWith(
          Reflect,
          controllerMetadataReflectKey,
          [
            {
              controllerName: optionsFixture.controllerName,
              path: optionsFixture.path,
              target: targetFixture,
            },
          ],
        );
      });
    });
  });
});
