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
vitest.mock('../calculations/buildNormalizedPath');

import {
  buildArrayMetadataWithElement,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { bindingScopeValues, injectable, ServiceIdentifier } from 'inversify';

import { controllerMetadataReflectKey } from '../../reflectMetadata/data/controllerMetadataReflectKey';
import { ControllerMetadata } from '../../routerExplorer/model/ControllerMetadata';
import { buildNormalizedPath } from '../calculations/buildNormalizedPath';
import { ControllerOptions } from '../models/ControllerOptions';
import { Controller } from './Controller';

describe(Controller, () => {
  describe('having a path', () => {
    let pathFixture: string;
    let targetFixture: NewableFunction;

    beforeAll(() => {
      pathFixture = '/api';
      targetFixture = class TestController {};
    });

    describe('when called', () => {
      let classDecoratorMock: Mock<ClassDecorator>;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        classDecoratorMock = vitest.fn();

        vitest.mocked(buildNormalizedPath).mockReturnValueOnce(pathFixture);

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

      it('should call buildNormalizedPath()', () => {
        expect(buildNormalizedPath).toHaveBeenCalledExactlyOnceWith(
          pathFixture,
        );
      });

      it('should call injectable', () => {
        expect(injectable).toHaveBeenCalledExactlyOnceWith(undefined);
      });

      it('should call ClassDecorator', () => {
        expect(classDecoratorMock).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
        );
      });

      it('should call buildArrayMetadataWithElement()', () => {
        const expected: ControllerMetadata = {
          path: pathFixture,
          priority: 0,
          serviceIdentifier: targetFixture,
          target: targetFixture,
        };

        expect(buildArrayMetadataWithElement).toHaveBeenCalledExactlyOnceWith(
          expected,
        );
      });

      it('should set metadata with controller path', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          Reflect,
          controllerMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
        );
      });
    });
  });

  describe('having ControllerOptions', () => {
    let optionsFixture: ControllerOptions;
    let targetFixture: NewableFunction;

    beforeAll(() => {
      optionsFixture = {
        path: '/api',
      };
      targetFixture = class TestController {};
    });

    describe('when called', () => {
      let classDecoratorMock: Mock<ClassDecorator>;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildNormalizedPath)
          .mockReturnValueOnce(optionsFixture.path as string);

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

      it('should call buildNormalizedPath()', () => {
        expect(buildNormalizedPath).toHaveBeenCalledExactlyOnceWith(
          optionsFixture.path,
        );
      });

      it('should call buildArrayMetadataWithElement()', () => {
        const expected: ControllerMetadata = {
          path: optionsFixture.path as string,
          priority: 0,
          serviceIdentifier: targetFixture,
          target: targetFixture,
        };

        expect(buildArrayMetadataWithElement).toHaveBeenCalledExactlyOnceWith(
          expected,
        );
      });

      it('should set metadata with controller options', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          Reflect,
          controllerMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
        );
      });
    });
  });

  describe('having ControllerOptions with scope', () => {
    let optionsFixture: ControllerOptions;
    let targetFixture: NewableFunction;

    beforeAll(() => {
      optionsFixture = {
        path: '/api',
        scope: bindingScopeValues.Singleton,
      };
      targetFixture = class TestController {};
    });

    describe('when called', () => {
      let classDecoratorMock: Mock<ClassDecorator>;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildNormalizedPath)
          .mockReturnValueOnce(optionsFixture.path as string);

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

      it('should call buildNormalizedPath()', () => {
        expect(buildNormalizedPath).toHaveBeenCalledExactlyOnceWith(
          optionsFixture.path,
        );
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

      it('should call buildArrayMetadataWithElement()', () => {
        const expected: ControllerMetadata = {
          path: optionsFixture.path as string,
          priority: 0,
          serviceIdentifier: targetFixture,
          target: targetFixture,
        };

        expect(buildArrayMetadataWithElement).toHaveBeenCalledExactlyOnceWith(
          expected,
        );
      });

      it('should set metadata with controller options', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          Reflect,
          controllerMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
        );
      });
    });
  });

  describe('having ControllerOptions with serviceIdentifier', () => {
    let optionsFixture: ControllerOptions;
    let targetFixture: NewableFunction;

    beforeAll(() => {
      optionsFixture = {
        serviceIdentifier: Symbol(),
      };
      targetFixture = class TestController {};
    });

    describe('when called', () => {
      let classDecoratorMock: Mock<ClassDecorator>;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];
      let normalizedPathFixture: string;

      beforeAll(() => {
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        normalizedPathFixture = '/';

        vitest
          .mocked(buildNormalizedPath)
          .mockReturnValueOnce(normalizedPathFixture);

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

      it('should call buildNormalizedPath()', () => {
        expect(buildNormalizedPath).toHaveBeenCalledExactlyOnceWith('/');
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

      it('should call buildArrayMetadataWithElement()', () => {
        const expected: ControllerMetadata = {
          path: normalizedPathFixture,
          priority: 0,
          serviceIdentifier:
            optionsFixture.serviceIdentifier as ServiceIdentifier,
          target: targetFixture,
        };

        expect(buildArrayMetadataWithElement).toHaveBeenCalledExactlyOnceWith(
          expected,
        );
      });

      it('should set metadata with controller options', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          Reflect,
          controllerMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
        );
      });
    });
  });

  describe('having ControllerOptions with priority', () => {
    let optionsFixture: ControllerOptions;
    let targetFixture: NewableFunction;

    beforeAll(() => {
      optionsFixture = {
        path: '/api',
        priority: 100,
      };
      targetFixture = class TestController {};
    });

    describe('when called', () => {
      let classDecoratorMock: Mock<ClassDecorator>;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildNormalizedPath)
          .mockReturnValueOnce(optionsFixture.path as string);

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

      it('should call buildNormalizedPath()', () => {
        expect(buildNormalizedPath).toHaveBeenCalledExactlyOnceWith(
          optionsFixture.path,
        );
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

      it('should call buildArrayMetadataWithElement()', () => {
        const expected: ControllerMetadata = {
          path: optionsFixture.path as string,
          priority: optionsFixture.priority as number,
          serviceIdentifier: targetFixture,
          target: targetFixture,
        };

        expect(buildArrayMetadataWithElement).toHaveBeenCalledExactlyOnceWith(
          expected,
        );
      });

      it('should set metadata with controller options', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          Reflect,
          controllerMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
        );
      });
    });
  });
});
