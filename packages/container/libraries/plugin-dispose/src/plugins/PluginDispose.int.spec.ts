import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import { ServiceIdentifier } from '@inversifyjs/common';
import { Container } from '@inversifyjs/container';

import { PluginDispose } from './PluginDispose';

describe(PluginDispose, () => {
  describe('having a container with a single singleton scoped binding with sync deactivation', () => {
    let bindingDeactivationMock: Mock<() => void>;
    let bindingResolvedValue: unknown;

    let container: Container;

    beforeAll(() => {
      const serviceId: ServiceIdentifier = Symbol.for('service-id');

      bindingDeactivationMock = vitest.fn();
      bindingResolvedValue = Symbol();

      container = new Container();

      container.register(PluginDispose);

      container
        .bind(serviceId)
        .toConstantValue(bindingResolvedValue)
        .onDeactivation(bindingDeactivationMock);

      container.get(serviceId);

      container[Symbol.dispose]();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call the deactivation function', () => {
      expect(bindingDeactivationMock).toHaveBeenCalledExactlyOnceWith(
        bindingResolvedValue,
      );
    });
  });

  describe('having a container with a single singleton scoped binding with async deactivation', () => {
    let bindingDeactivationMock: Mock<() => void>;
    let bindingResolvedValue: unknown;

    let container: Container;

    beforeAll(async () => {
      const serviceId: ServiceIdentifier = Symbol.for('service-id');

      bindingDeactivationMock = vitest.fn().mockResolvedValueOnce(undefined);
      bindingResolvedValue = Symbol();

      container = new Container();

      container.register(PluginDispose);

      container
        .bind(serviceId)
        .toConstantValue(bindingResolvedValue)
        .onDeactivation(bindingDeactivationMock);

      container.get(serviceId);

      await container[Symbol.asyncDispose]();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call the deactivation function', () => {
      expect(bindingDeactivationMock).toHaveBeenCalledExactlyOnceWith(
        bindingResolvedValue,
      );
    });
  });

  describe('having a container with a singleton scoped bindings with async deactivation depending on another singleton scoped binding with async deactivation', () => {
    let firstBindingDeactivationMock: Mock<() => void>;
    let secondBindingDeactivationMock: Mock<() => void>;

    let firstBindingResolvedValue: unknown;
    let secondBindingResolvedValue: unknown;

    let container: Container;

    beforeAll(async () => {
      const firstServiceId: ServiceIdentifier = Symbol.for('service-id');
      const secondServiceId: ServiceIdentifier = Symbol.for('service-id-2');

      firstBindingDeactivationMock = vitest
        .fn()
        .mockResolvedValueOnce(undefined);
      secondBindingDeactivationMock = vitest
        .fn()
        .mockResolvedValueOnce(undefined);

      firstBindingResolvedValue = Symbol();
      secondBindingResolvedValue = Symbol();

      container = new Container();

      container.register(PluginDispose);

      container
        .bind(firstServiceId)
        .toResolvedValue(
          (_dependency: unknown) => firstBindingResolvedValue,
          [secondServiceId],
        )
        .inSingletonScope()
        .onDeactivation(firstBindingDeactivationMock);

      container
        .bind(secondServiceId)
        .toConstantValue(secondBindingResolvedValue)
        .onDeactivation(secondBindingDeactivationMock);

      container.get(firstServiceId);

      await container[Symbol.asyncDispose]();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call the first deactivation function', () => {
      expect(firstBindingDeactivationMock).toHaveBeenCalledExactlyOnceWith(
        firstBindingResolvedValue,
      );
    });

    it('should call the second deactivation function', () => {
      expect(secondBindingDeactivationMock).toHaveBeenCalledExactlyOnceWith(
        secondBindingResolvedValue,
      );
    });

    it('should call the deactivation functions in the correct order', () => {
      const [firstCallOrder]: [number] = firstBindingDeactivationMock.mock
        .invocationCallOrder as [number];

      const [secondCallOrder]: [number] = secondBindingDeactivationMock.mock
        .invocationCallOrder as [number];

      expect(firstCallOrder).toBeLessThan(secondCallOrder);
    });
  });
});
