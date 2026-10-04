import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));
vitest.mock(import('inversify'));

import {
  buildArrayMetadataWithElement,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import {
  bindingScopeValues,
  injectable,
  type ServiceIdentifier,
} from 'inversify';

import { InversifyGrpcAdapterError } from '../../error/models/InversifyGrpcAdapterError.js';
import { InversifyGrpcAdapterErrorKind } from '../../error/models/InversifyGrpcAdapterErrorKind.js';
import { serviceMetadataReflectKey } from '../../reflectMetadata/data/serviceMetadataReflectKey.js';
import { type GrpcServiceDefinition } from '../models/GrpcServiceDefinition.js';
import { type ServiceMetadata } from '../models/ServiceMetadata.js';
import { type ServiceOptions } from '../models/ServiceOptions.js';
import { Service } from './Service.js';

describe(Service, () => {
  describe('having a service definition', () => {
    let definitionFixture: GrpcServiceDefinition;
    let targetFixture: NewableFunction;

    beforeAll(() => {
      definitionFixture = {};
      targetFixture = class HeroService {};
    });

    describe('when called', () => {
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];
      let classDecoratorMock: Mock<ClassDecorator>;

      beforeAll(() => {
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;
        classDecoratorMock = vitest.fn();

        vitest
          .mocked(injectable)
          .mockReturnValueOnce(classDecoratorMock as ClassDecorator);

        vitest
          .mocked(buildArrayMetadataWithElement)
          .mockReturnValueOnce(callbackFixture);

        Service(definitionFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call injectable()', () => {
        expect(injectable).toHaveBeenCalledExactlyOnceWith(undefined);
      });

      it('should call the injectable class decorator', () => {
        expect(classDecoratorMock).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
        );
      });

      it('should call buildArrayMetadataWithElement()', () => {
        const expected: ServiceMetadata = {
          definition: definitionFixture,
          serviceIdentifier: targetFixture as ServiceIdentifier,
          target: targetFixture,
        };

        expect(buildArrayMetadataWithElement).toHaveBeenCalledExactlyOnceWith(
          expected,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          Reflect,
          serviceMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
        );
      });
    });
  });

  describe('having a service definition and options', () => {
    let definitionFixture: GrpcServiceDefinition;
    let optionsFixture: ServiceOptions;
    let targetFixture: NewableFunction;

    beforeAll(() => {
      definitionFixture = {};
      optionsFixture = {
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: Symbol('hero-service'),
      };
      targetFixture = class HeroService {};
    });

    describe('when called', () => {
      let classDecoratorMock: Mock<ClassDecorator>;

      beforeAll(() => {
        classDecoratorMock = vitest.fn();

        vitest
          .mocked(injectable)
          .mockReturnValueOnce(classDecoratorMock as ClassDecorator);

        Service(definitionFixture, optionsFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call injectable() with the scope', () => {
        expect(injectable).toHaveBeenCalledExactlyOnceWith(
          optionsFixture.scope,
        );
      });

      it('should call buildArrayMetadataWithElement() with the service identifier', () => {
        const expected: ServiceMetadata = {
          definition: definitionFixture,
          serviceIdentifier: optionsFixture.serviceIdentifier as symbol,
          target: targetFixture,
        };

        expect(buildArrayMetadataWithElement).toHaveBeenCalledExactlyOnceWith(
          expected,
        );
      });
    });
  });

  describe('having a definition that is not an object', () => {
    describe('when called', () => {
      let errorFixture: unknown;

      beforeAll(() => {
        try {
          Service(undefined as unknown as GrpcServiceDefinition)(
            class InvalidService {},
          );
        } catch (error: unknown) {
          errorFixture = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw InversifyGrpcAdapterError', () => {
        expect(errorFixture).toBeInstanceOf(InversifyGrpcAdapterError);
        expect((errorFixture as InversifyGrpcAdapterError).kind).toBe(
          InversifyGrpcAdapterErrorKind.invalidServiceDefinition,
        );
        expect((errorFixture as InversifyGrpcAdapterError).message).toBe(
          '@Service() requires a service definition',
        );
      });

      it('should not call injectable()', () => {
        expect(injectable).not.toHaveBeenCalled();
      });
    });
  });
});
