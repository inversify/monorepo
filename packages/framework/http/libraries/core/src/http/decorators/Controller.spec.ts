import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));
vitest.mock(import('../calculations/buildNormalizedPath.js'));

import {
  buildArrayMetadataWithElement,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { controllerMetadataReflectKey } from '../../reflectMetadata/data/controllerMetadataReflectKey.js';
import { type ControllerMetadata } from '../../routerExplorer/model/ControllerMetadata.js';
import { buildNormalizedPath } from '../calculations/buildNormalizedPath.js';
import { type Controller } from '../models/Controller.js';
import { type ControllerOptions } from '../models/ControllerOptions.js';
import { Controller as ControllerDecorator } from './Controller.js';

describe(ControllerDecorator, () => {
  describe('having a path', () => {
    let pathFixture: string;
    let targetFixture: NewableFunction & ServiceIdentifier;
    let contextFixture: ClassDecoratorContext;

    beforeAll(() => {
      pathFixture = '/api';
      targetFixture = class TestController {};
      contextFixture = { metadata: {} } as unknown as ClassDecoratorContext;
    });

    describe('when called', () => {
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest.mocked(buildNormalizedPath).mockReturnValueOnce(pathFixture);

        vitest
          .mocked(buildArrayMetadataWithElement)
          .mockReturnValueOnce(callbackFixture);

        ControllerDecorator(pathFixture)(targetFixture, contextFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildNormalizedPath()', () => {
        expect(buildNormalizedPath).toHaveBeenCalledExactlyOnceWith(
          pathFixture,
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
    let targetFixture: NewableFunction & ServiceIdentifier;
    let contextFixture: ClassDecoratorContext;

    beforeAll(() => {
      optionsFixture = {
        path: '/api',
      };
      targetFixture = class TestController {};
      contextFixture = { metadata: {} } as unknown as ClassDecoratorContext;
    });

    describe('when called', () => {
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

        ControllerDecorator(optionsFixture)(targetFixture, contextFixture);
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

  describe('having ControllerOptions with serviceIdentifier', () => {
    let optionsFixture: ControllerOptions;
    let targetFixture: NewableFunction;
    let contextFixture: ClassDecoratorContext;

    beforeAll(() => {
      optionsFixture = {
        serviceIdentifier: Symbol(),
      };
      targetFixture = class TestController {};
      contextFixture = { metadata: {} } as unknown as ClassDecoratorContext;
    });

    describe('when called', () => {
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

        ControllerDecorator(optionsFixture)(targetFixture, contextFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildNormalizedPath()', () => {
        expect(buildNormalizedPath).toHaveBeenCalledExactlyOnceWith('/');
      });

      it('should call buildArrayMetadataWithElement()', () => {
        const expected: ControllerMetadata = {
          path: normalizedPathFixture,
          priority: 0,
          serviceIdentifier:
            optionsFixture.serviceIdentifier as ServiceIdentifier<Controller>,
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
    let targetFixture: NewableFunction & ServiceIdentifier;
    let contextFixture: ClassDecoratorContext;

    beforeAll(() => {
      optionsFixture = {
        path: '/api',
        priority: 100,
      };
      targetFixture = class TestController {};
      contextFixture = { metadata: {} } as unknown as ClassDecoratorContext;
    });

    describe('when called', () => {
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

        ControllerDecorator(optionsFixture)(targetFixture, contextFixture);
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
