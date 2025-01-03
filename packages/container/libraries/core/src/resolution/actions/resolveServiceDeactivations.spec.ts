import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

import { ServiceIdentifier } from '@inversifyjs/common';

jest.mock('./resolveBindingDeactivations');

import { ConstantValueBindingFixtures } from '../../binding/fixtures/ConstantValueBindingFixtures';
import { InstanceBindingFixtures } from '../../binding/fixtures/InstanceBindingFixtures';
import { ConstantValueBinding } from '../../binding/models/ConstantValueBinding';
import { InstanceBinding } from '../../binding/models/InstanceBinding';
import { ClassMetadataFixtures } from '../../metadata/fixtures/ClassMetadataFixtures';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { DeactivationParams } from '../models/DeactivationParams';
import { resolveBindingDeactivations } from './resolveBindingDeactivations';
import { resolveServiceDeactivations } from './resolveServiceDeactivations';

describe(resolveServiceDeactivations.name, () => {
  let paramsMock: jest.Mocked<DeactivationParams>;
  let serviceIdentifierFixture: ServiceIdentifier;

  beforeAll(() => {
    paramsMock = {
      getBindings: jest.fn() as unknown,
      getClassMetadata: jest.fn(),
      getDeactivations: jest.fn(),
    } as Partial<
      jest.Mocked<DeactivationParams>
    > as jest.Mocked<DeactivationParams>;
    serviceIdentifierFixture = 'service-id';
  });

  describe('when called, and params.getBindings() returns undefined', () => {
    let result: unknown;

    beforeAll(() => {
      result = resolveServiceDeactivations(
        paramsMock,
        serviceIdentifierFixture,
      );
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call params.getBindings()', () => {
      expect(paramsMock.getBindings).toHaveBeenCalledTimes(1);
      expect(paramsMock.getBindings).toHaveBeenCalledWith(
        serviceIdentifierFixture,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });

  describe('when called, and params.getBindings() returns an array with singleton ScopedBinding with no cached value', () => {
    let result: unknown;

    beforeAll(() => {
      paramsMock.getBindings.mockReturnValueOnce([
        ConstantValueBindingFixtures.withCacheWithIsRightFalse,
      ]);

      result = resolveServiceDeactivations(
        paramsMock,
        serviceIdentifierFixture,
      );
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call params.getBindings()', () => {
      expect(paramsMock.getBindings).toHaveBeenCalledTimes(1);
      expect(paramsMock.getBindings).toHaveBeenCalledWith(
        serviceIdentifierFixture,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });

  describe('when called, and params.getBindings() returns an array with non instance singleton ScopedBinding with cached value', () => {
    let bindingFixture: ConstantValueBinding<unknown>;

    let result: unknown;

    beforeAll(() => {
      bindingFixture = ConstantValueBindingFixtures.withCacheWithIsRightTrue;

      paramsMock.getBindings.mockReturnValueOnce([bindingFixture]);

      result = resolveServiceDeactivations(
        paramsMock,
        serviceIdentifierFixture,
      );
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call params.getBindings()', () => {
      expect(paramsMock.getBindings).toHaveBeenCalledTimes(1);
      expect(paramsMock.getBindings).toHaveBeenCalledWith(
        serviceIdentifierFixture,
      );
    });

    it('should call resolveBindingDeactivations()', () => {
      expect(resolveBindingDeactivations).toHaveBeenCalledTimes(1);
      expect(resolveBindingDeactivations).toHaveBeenCalledWith(
        paramsMock,
        serviceIdentifierFixture,
        bindingFixture.cache.value,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });

  describe('when called, and params.getBindings() returns an array with instance singleton ScopedBinding with cached value and params.getClassMetadata() returns metadata with preDestroy method, and preDestroy method returns undefined', () => {
    let bindingFixture: InstanceBinding<unknown>;
    let classMetadataFixture: ClassMetadata;
    let preDestoyMock: jest.Mock<() => void>;

    let result: unknown;

    beforeAll(() => {
      classMetadataFixture = ClassMetadataFixtures.withPreDestroyMethodName;
      preDestoyMock = jest.fn();

      bindingFixture = {
        ...InstanceBindingFixtures.withCacheWithScopeSingleton,
        cache: {
          isRight: true,
          value: {
            [classMetadataFixture.lifecycle.preDestroyMethodName as string]:
              preDestoyMock,
          },
        },
      };

      paramsMock.getBindings.mockReturnValueOnce([bindingFixture]);
      paramsMock.getClassMetadata.mockReturnValueOnce(classMetadataFixture);

      result = resolveServiceDeactivations(
        paramsMock,
        serviceIdentifierFixture,
      );
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call params.getBindings()', () => {
      expect(paramsMock.getBindings).toHaveBeenCalledTimes(1);
      expect(paramsMock.getBindings).toHaveBeenCalledWith(
        serviceIdentifierFixture,
      );
    });

    it('should call preDestroy method', () => {
      expect(preDestoyMock).toHaveBeenCalledTimes(1);
      expect(preDestoyMock).toHaveBeenCalledWith();
    });

    it('should call resolveBindingDeactivations()', () => {
      expect(resolveBindingDeactivations).toHaveBeenCalledTimes(1);
      expect(resolveBindingDeactivations).toHaveBeenCalledWith(
        paramsMock,
        serviceIdentifierFixture,
        bindingFixture.cache.value,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });

  describe('when called, and params.getBindings() returns an array with instance singleton ScopedBinding with cached value and params.getClassMetadata() returns metadata with preDestroy method, and preDestroy method returns promise', () => {
    let bindingFixture: InstanceBinding<unknown>;
    let classMetadataFixture: ClassMetadata;
    let preDestoyMock: jest.Mock<() => Promise<void>>;

    let result: unknown;

    beforeAll(async () => {
      classMetadataFixture = ClassMetadataFixtures.withPreDestroyMethodName;
      preDestoyMock = jest.fn();

      bindingFixture = {
        ...InstanceBindingFixtures.withCacheWithScopeSingleton,
        cache: {
          isRight: true,
          value: {
            [classMetadataFixture.lifecycle.preDestroyMethodName as string]:
              preDestoyMock,
          },
        },
      };

      paramsMock.getBindings.mockReturnValueOnce([bindingFixture]);
      paramsMock.getClassMetadata.mockReturnValueOnce(classMetadataFixture);
      preDestoyMock.mockResolvedValueOnce(undefined);

      result = await resolveServiceDeactivations(
        paramsMock,
        serviceIdentifierFixture,
      );
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call params.getBindings()', () => {
      expect(paramsMock.getBindings).toHaveBeenCalledTimes(1);
      expect(paramsMock.getBindings).toHaveBeenCalledWith(
        serviceIdentifierFixture,
      );
    });

    it('should call preDestroy method', () => {
      expect(preDestoyMock).toHaveBeenCalledTimes(1);
      expect(preDestoyMock).toHaveBeenCalledWith();
    });

    it('should call resolveBindingDeactivations()', () => {
      expect(resolveBindingDeactivations).toHaveBeenCalledTimes(1);
      expect(resolveBindingDeactivations).toHaveBeenCalledWith(
        paramsMock,
        serviceIdentifierFixture,
        bindingFixture.cache.value,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });
});
