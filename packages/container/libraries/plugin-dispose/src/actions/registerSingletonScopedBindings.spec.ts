import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import {
  bindingScopeValues,
  bindingTypeValues,
  ClassMetadata,
  GetPlanOptions,
  InstanceBindingNode,
  LeafBindingNode,
  PlanResult,
  PlanServiceNode,
  PlanServiceRedirectionBindingNode,
  ResolvedValueBindingNode,
} from '@inversifyjs/core';

vitest.mock('./getPluginDisposeBinding');
vitest.mock('./setPluginDisposeBinding');

import { BindingDisposeMetadata } from '../models/BindingDisposeMetadata';
import { SingletonScopedBinding } from '../models/SingletonScopedBinding';
import { Writable } from '../models/Writable';
import { getPluginDisposeBinding } from './getPluginDisposeBinding';
import { registerSingletonScopedBindings } from './registerSingletonScopedBindings';
import { setPluginDisposeBinding } from './setPluginDisposeBinding';

describe(registerSingletonScopedBindings, () => {
  describe('having a PlanResult with no bindings', () => {
    let optionsFixture: GetPlanOptions;
    let planResultFixture: PlanResult;

    beforeAll(() => {
      optionsFixture = Symbol() as unknown as GetPlanOptions;
      planResultFixture = {
        tree: {
          root: {
            bindings: undefined,
            isContextFree: true,
            serviceIdentifier: 'service-id',
          },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = registerSingletonScopedBindings(
          optionsFixture,
          planResultFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not call setPluginDisposeBinding()', () => {
        expect(setPluginDisposeBinding).not.toHaveBeenCalled();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a PlanResult with a single leaf singleton scoped binding node', () => {
    let leafBindingNode: LeafBindingNode;
    let optionsFixture: GetPlanOptions;
    let planResultFixture: PlanResult;

    beforeAll(() => {
      optionsFixture = Symbol() as unknown as GetPlanOptions;

      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };

      leafBindingNode = {
        binding: {
          cache: {
            isRight: false,
            value: undefined,
          },
          id: 1,
          isSatisfiedBy: () => true,
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: 'constant-value-service-id',
          type: bindingTypeValues.ConstantValue,
          value: Symbol(),
        },
      };

      (serviceNode as Writable<PlanServiceNode>).bindings = leafBindingNode;

      planResultFixture = {
        tree: {
          root: {
            bindings: leafBindingNode,
            isContextFree: true,
            serviceIdentifier: 'service-id',
          },
        },
      };
    });

    describe('when called, and getPluginDisposeBinding() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(getPluginDisposeBinding).mockReturnValueOnce(undefined);

        result = registerSingletonScopedBindings(
          optionsFixture,
          planResultFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getPluginDisposeBinding()', () => {
        expect(getPluginDisposeBinding).toHaveBeenCalledExactlyOnceWith(
          leafBindingNode.binding,
        );
      });

      it('should call setPluginDisposeBinding()', () => {
        expect(setPluginDisposeBinding).toHaveBeenCalledExactlyOnceWith(
          leafBindingNode.binding,
          {
            dependendentBindings: new Set(),
          },
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and getPluginDisposeBinding() returns BindingDisposeMetadata', () => {
      let bindingDisposeMetadataFixture: BindingDisposeMetadata;
      let result: unknown;

      beforeAll(() => {
        bindingDisposeMetadataFixture = {
          dependendentBindings: new Set(),
        };

        vitest
          .mocked(getPluginDisposeBinding)
          .mockReturnValueOnce(bindingDisposeMetadataFixture);

        result = registerSingletonScopedBindings(
          optionsFixture,
          planResultFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getPluginDisposeBinding()', () => {
        expect(getPluginDisposeBinding).toHaveBeenCalledExactlyOnceWith(
          leafBindingNode.binding,
        );
      });

      it('should not call setPluginDisposeBinding()', () => {
        expect(setPluginDisposeBinding).not.toHaveBeenCalled();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a PlanResult with an array with a single leaf singleton scoped binding node', () => {
    let leafBindingNode: LeafBindingNode;
    let optionsFixture: GetPlanOptions;
    let planResultFixture: PlanResult;

    beforeAll(() => {
      optionsFixture = Symbol() as unknown as GetPlanOptions;

      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };

      leafBindingNode = {
        binding: {
          cache: {
            isRight: false,
            value: undefined,
          },
          id: 1,
          isSatisfiedBy: () => true,
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: 'constant-value-service-id',
          type: bindingTypeValues.ConstantValue,
          value: Symbol(),
        },
      };

      (serviceNode as Writable<PlanServiceNode>).bindings = leafBindingNode;

      planResultFixture = {
        tree: {
          root: {
            bindings: [leafBindingNode],
            isContextFree: true,
            serviceIdentifier: 'service-id',
          },
        },
      };
    });

    describe('when called, and getPluginDisposeBinding() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(getPluginDisposeBinding).mockReturnValueOnce(undefined);

        result = registerSingletonScopedBindings(
          optionsFixture,
          planResultFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getPluginDisposeBinding()', () => {
        expect(getPluginDisposeBinding).toHaveBeenCalledExactlyOnceWith(
          leafBindingNode.binding,
        );
      });

      it('should call setPluginDisposeBinding()', () => {
        expect(setPluginDisposeBinding).toHaveBeenCalledExactlyOnceWith(
          leafBindingNode.binding,
          {
            dependendentBindings: new Set(),
          },
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a PlanResult with a single instance singleton scoped binding node', () => {
    let instanceBindingNode: InstanceBindingNode;
    let leafBindingNode: LeafBindingNode;
    let leafServiceNode: PlanServiceNode;
    let optionsFixture: GetPlanOptions;
    let planResultFixture: PlanResult;

    beforeAll(() => {
      optionsFixture = Symbol() as unknown as GetPlanOptions;

      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };

      instanceBindingNode = {
        binding: {
          cache: {
            isRight: false,
            value: undefined,
          },
          id: 1,
          implementationType: class {},
          isSatisfiedBy: () => true,
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: 'instance-service-id',
          type: bindingTypeValues.Instance,
        },
        classMetadata: Symbol() as unknown as ClassMetadata,
        constructorParams: [],
        propertyParams: new Map(),
      };

      leafBindingNode = {
        binding: {
          cache: {
            isRight: false,
            value: undefined,
          },
          id: 2,
          isSatisfiedBy: () => true,
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: 'constant-value-service-id',
          type: bindingTypeValues.ConstantValue,
          value: Symbol(),
        },
      };

      leafServiceNode = {
        bindings: leafBindingNode,
        isContextFree: true,
        serviceIdentifier: 'constant-value-service-id',
      };

      (serviceNode as Writable<PlanServiceNode>).bindings = instanceBindingNode;

      instanceBindingNode.constructorParams.push(leafServiceNode);
      instanceBindingNode.propertyParams.set('property', leafServiceNode);

      planResultFixture = {
        tree: {
          root: {
            bindings: instanceBindingNode,
            isContextFree: true,
            serviceIdentifier: 'service-id',
          },
        },
      };
    });

    describe('when called, and getPluginDisposeBinding() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(getPluginDisposeBinding)
          .mockReturnValueOnce(undefined)
          .mockReturnValueOnce(undefined)
          .mockReturnValueOnce(undefined);

        result = registerSingletonScopedBindings(
          optionsFixture,
          planResultFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getPluginDisposeBinding()', () => {
        expect(getPluginDisposeBinding).toHaveBeenCalledTimes(3);
        expect(getPluginDisposeBinding).toHaveBeenNthCalledWith(
          1,
          instanceBindingNode.binding,
        );
        expect(getPluginDisposeBinding).toHaveBeenNthCalledWith(
          2,
          leafBindingNode.binding,
        );
        expect(getPluginDisposeBinding).toHaveBeenNthCalledWith(
          3,
          leafBindingNode.binding,
        );
      });

      it('should call setPluginDisposeBinding()', () => {
        expect(setPluginDisposeBinding).toHaveBeenCalledTimes(3);
        expect(setPluginDisposeBinding).toHaveBeenNthCalledWith(
          1,
          instanceBindingNode.binding,
          {
            dependendentBindings: new Set(),
          },
        );
        expect(setPluginDisposeBinding).toHaveBeenNthCalledWith(
          2,
          leafBindingNode.binding,
          {
            dependendentBindings: new Set([instanceBindingNode.binding]),
          },
        );
        expect(setPluginDisposeBinding).toHaveBeenNthCalledWith(
          3,
          leafBindingNode.binding,
          {
            dependendentBindings: new Set([instanceBindingNode.binding]),
          },
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and getPluginDisposeBinding() returns BindingDisposeMetadata', () => {
      let bindingDisposeMetadataFixture: BindingDisposeMetadata;

      let result: unknown;

      beforeAll(() => {
        bindingDisposeMetadataFixture = {
          dependendentBindings: new Set([
            Symbol(),
          ] as unknown[] as SingletonScopedBinding[]),
        };

        vitest
          .mocked(getPluginDisposeBinding)
          .mockReturnValueOnce(bindingDisposeMetadataFixture);

        result = registerSingletonScopedBindings(
          optionsFixture,
          planResultFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getPluginDisposeBinding()', () => {
        expect(getPluginDisposeBinding).toHaveBeenCalledExactlyOnceWith(
          instanceBindingNode.binding,
        );
      });

      it('should not call setPluginDisposeBinding()', () => {
        expect(setPluginDisposeBinding).not.toHaveBeenCalled();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a PlanResult with a single resolved value singleton scoped binding node', () => {
    let resolvedValueBindingNode: ResolvedValueBindingNode;
    let leafBindingNode: LeafBindingNode;
    let leafServiceNode: PlanServiceNode;
    let optionsFixture: GetPlanOptions;
    let planResultFixture: PlanResult;

    beforeAll(() => {
      optionsFixture = Symbol() as unknown as GetPlanOptions;

      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };

      resolvedValueBindingNode = {
        binding: {
          cache: {
            isRight: false,
            value: undefined,
          },
          factory: () => Symbol(),
          id: 1,
          isSatisfiedBy: () => true,
          metadata: {
            arguments: [],
          },
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: 'resolved-value-service-id',
          type: bindingTypeValues.ResolvedValue,
        },
        params: [],
      };

      leafBindingNode = {
        binding: {
          cache: {
            isRight: false,
            value: undefined,
          },
          id: 2,
          isSatisfiedBy: () => true,
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: 'constant-value-service-id',
          type: bindingTypeValues.ConstantValue,
          value: Symbol(),
        },
      };

      leafServiceNode = {
        bindings: leafBindingNode,
        isContextFree: true,
        serviceIdentifier: 'constant-value-service-id',
      };

      (serviceNode as Writable<PlanServiceNode>).bindings =
        resolvedValueBindingNode;

      resolvedValueBindingNode.params.push(leafServiceNode);

      planResultFixture = {
        tree: {
          root: {
            bindings: resolvedValueBindingNode,
            isContextFree: true,
            serviceIdentifier: 'service-id',
          },
        },
      };
    });

    describe('when called, and getPluginDisposeBinding() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(getPluginDisposeBinding)
          .mockReturnValueOnce(undefined)
          .mockReturnValueOnce(undefined);

        result = registerSingletonScopedBindings(
          optionsFixture,
          planResultFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getPluginDisposeBinding()', () => {
        expect(getPluginDisposeBinding).toHaveBeenCalledTimes(2);
        expect(getPluginDisposeBinding).toHaveBeenNthCalledWith(
          1,
          resolvedValueBindingNode.binding,
        );
        expect(getPluginDisposeBinding).toHaveBeenNthCalledWith(
          2,
          leafBindingNode.binding,
        );
      });

      it('should call setPluginDisposeBinding()', () => {
        expect(setPluginDisposeBinding).toHaveBeenCalledTimes(2);
        expect(setPluginDisposeBinding).toHaveBeenNthCalledWith(
          1,
          resolvedValueBindingNode.binding,
          {
            dependendentBindings: new Set(),
          },
        );
        expect(setPluginDisposeBinding).toHaveBeenNthCalledWith(
          2,
          leafBindingNode.binding,
          {
            dependendentBindings: new Set([resolvedValueBindingNode.binding]),
          },
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and getPluginDisposeBinding() returns BindingDisposeMetadata', () => {
      let bindingDisposeMetadataFixture: BindingDisposeMetadata;

      let result: unknown;

      beforeAll(() => {
        bindingDisposeMetadataFixture = {
          dependendentBindings: new Set([
            Symbol(),
          ] as unknown[] as SingletonScopedBinding[]),
        };

        vitest
          .mocked(getPluginDisposeBinding)
          .mockReturnValueOnce(bindingDisposeMetadataFixture);

        result = registerSingletonScopedBindings(
          optionsFixture,
          planResultFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getPluginDisposeBinding()', () => {
        expect(getPluginDisposeBinding).toHaveBeenCalledExactlyOnceWith(
          resolvedValueBindingNode.binding,
        );
      });

      it('should not call setPluginDisposeBinding()', () => {
        expect(setPluginDisposeBinding).not.toHaveBeenCalled();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a PlanResult with a single service redirection node', () => {
    let planServiceRedirectionBindingNode: PlanServiceRedirectionBindingNode;
    let leafBindingNode: LeafBindingNode;
    let optionsFixture: GetPlanOptions;
    let planResultFixture: PlanResult;

    beforeAll(() => {
      optionsFixture = Symbol() as unknown as GetPlanOptions;

      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };

      planServiceRedirectionBindingNode = {
        binding: {
          id: 1,
          isSatisfiedBy: () => true,
          moduleId: undefined,
          serviceIdentifier: 'service-redirection-service-id',
          targetServiceIdentifier: 'constant-value-service-id',
          type: bindingTypeValues.ServiceRedirection,
        },
        redirections: [],
      };

      leafBindingNode = {
        binding: {
          cache: {
            isRight: false,
            value: undefined,
          },
          id: 2,
          isSatisfiedBy: () => true,
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: 'constant-value-service-id',
          type: bindingTypeValues.ConstantValue,
          value: Symbol(),
        },
      };

      (serviceNode as Writable<PlanServiceNode>).bindings =
        planServiceRedirectionBindingNode;

      planServiceRedirectionBindingNode.redirections.push(leafBindingNode);

      planResultFixture = {
        tree: {
          root: {
            bindings: planServiceRedirectionBindingNode,
            isContextFree: true,
            serviceIdentifier: 'service-id',
          },
        },
      };
    });

    describe('when called, and getPluginDisposeBinding() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(getPluginDisposeBinding).mockReturnValueOnce(undefined);

        result = registerSingletonScopedBindings(
          optionsFixture,
          planResultFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getPluginDisposeBinding()', () => {
        expect(getPluginDisposeBinding).toHaveBeenCalledExactlyOnceWith(
          leafBindingNode.binding,
        );
      });

      it('should call setPluginDisposeBinding()', () => {
        expect(setPluginDisposeBinding).toHaveBeenCalledExactlyOnceWith(
          leafBindingNode.binding,
          {
            dependendentBindings: new Set(),
          },
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
