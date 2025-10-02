import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

vitest.mock('./resolveConstantValueBinding');
vitest.mock('./resolveDynamicValueBinding');
vitest.mock('./resolveFactoryBinding');
vitest.mock('./resolveInstanceBindingConstructorParams', () => ({
  resolveInstanceBindingConstructorParams: vitest
    .fn()
    .mockReturnValue(vitest.fn()),
}));
vitest.mock('./resolveInstanceBindingNode', () => ({
  resolveInstanceBindingNode: vitest.fn().mockReturnValue(vitest.fn()),
}));
vitest.mock('./resolveInstanceBindingNodeAsyncFromConstructorParams', () => ({
  resolveInstanceBindingNodeAsyncFromConstructorParams: vitest
    .fn()
    .mockReturnValue(vitest.fn()),
}));
vitest.mock('./resolveInstanceBindingNodeFromConstructorParams', () => ({
  resolveInstanceBindingNodeFromConstructorParams: vitest
    .fn()
    .mockReturnValue(vitest.fn()),
}));
vitest.mock('./resolveProviderBinding');
vitest.mock('./resolveScopedInstanceBindingNode', () => ({
  resolveScopedInstanceBindingNode: vitest.fn().mockReturnValue(vitest.fn()),
}));
vitest.mock('./resolveScopedResolvedValueBindingNode', () => ({
  resolveScopedResolvedValueBindingNode: vitest
    .fn()
    .mockReturnValue(vitest.fn()),
}));
vitest.mock('./resolveServiceRedirectionBindingNode', () => ({
  resolveServiceRedirectionBindingNode: vitest
    .fn()
    .mockReturnValue(vitest.fn()),
}));
vitest.mock('./resolveResolvedValueBindingParams', () => ({
  resolveResolvedValueBindingParams: vitest.fn().mockReturnValue(vitest.fn()),
}));
vitest.mock('./resolveResolvedValueBindingNode', () => ({
  resolveResolvedValueBindingNode: vitest.fn().mockReturnValue(vitest.fn()),
}));
vitest.mock('./setInstanceProperties', () => ({
  setInstanceProperties: vitest.fn().mockReturnValue(vitest.fn()),
}));

import { bindingScopeValues } from '../../binding/models/BindingScope';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { ConstantValueBinding } from '../../binding/models/ConstantValueBinding';
import { DynamicValueBinding } from '../../binding/models/DynamicValueBinding';
import { Factory } from '../../binding/models/Factory';
import { FactoryBinding } from '../../binding/models/FactoryBinding';
import { InstanceBinding } from '../../binding/models/InstanceBinding';
import { Provider } from '../../binding/models/Provider';
import { ProviderBinding } from '../../binding/models/ProviderBinding';
import { ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding';
import { ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding';
import { Writable } from '../../common/models/Writable';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { InstanceBindingNode } from '../../planning/models/InstanceBindingNode';
import { PlanBindingNode } from '../../planning/models/PlanBindingNode';
import { PlanServiceNode } from '../../planning/models/PlanServiceNode';
import { PlanServiceRedirectionBindingNode } from '../../planning/models/PlanServiceRedirectionBindingNode';
import { ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode';
import { ResolutionParams } from '../models/ResolutionParams';
import { resolve } from './resolve';
import { resolveConstantValueBinding } from './resolveConstantValueBinding';
import { resolveDynamicValueBinding } from './resolveDynamicValueBinding';
import { resolveFactoryBinding } from './resolveFactoryBinding';
import { resolveProviderBinding } from './resolveProviderBinding';
import { resolveScopedInstanceBindingNode } from './resolveScopedInstanceBindingNode';
import { resolveScopedResolvedValueBindingNode } from './resolveScopedResolvedValueBindingNode';
import { resolveServiceRedirectionBindingNode } from './resolveServiceRedirectionBindingNode';

describe(resolve, () => {
  let resolveScopedInstanceBindingNodeMock: Mock<
    ReturnType<typeof resolveScopedInstanceBindingNode>
  >;
  let resolveScopedResolvedValueBindingNodeMock: Mock<
    ReturnType<typeof resolveScopedResolvedValueBindingNode>
  >;
  let resolveServiceRedirectionBindingNodeMock: Mock<
    ReturnType<typeof resolveServiceRedirectionBindingNode>
  >;

  beforeAll(() => {
    resolveScopedInstanceBindingNodeMock = vitest.mocked(
      resolveScopedInstanceBindingNode(
        vitest.fn<
          (
            params: ResolutionParams,
            node: InstanceBindingNode,
          ) => Promise<unknown>
        >(),
      ),
    );
    resolveScopedResolvedValueBindingNodeMock = vitest.mocked(
      resolveScopedResolvedValueBindingNode(
        vitest.fn<
          (
            params: ResolutionParams,
            node: ResolvedValueBindingNode,
          ) => Promise<unknown>
        >(),
      ),
    );
    resolveServiceRedirectionBindingNodeMock = vitest.mocked(
      resolveServiceRedirectionBindingNode(vitest.fn()),
    );
  });

  describe('having ResolutionParams with plan tree with root with no bindings', () => {
    let resolutionParamsFixture: ResolutionParams;

    beforeAll(() => {
      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: {
              bindings: undefined,
              serviceIdentifier: 'service-id',
            },
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolve(resolutionParamsFixture);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having ResolutionParams with plan tree with root with empty array bindings', () => {
    let resolutionParamsFixture: ResolutionParams;

    beforeAll(() => {
      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: {
              bindings: [],
              isContextFree: true,
              serviceIdentifier: 'service-id',
            },
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolve(resolutionParamsFixture);
      });

      it('should return expected result', () => {
        expect(result).toStrictEqual([]);
      });
    });
  });

  describe('having ResolutionParams with plan tree with root with constant value binding', () => {
    let resolutionParamsFixture: ResolutionParams;
    let bindingFixture: ConstantValueBinding<unknown>;

    beforeAll(() => {
      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };

      bindingFixture = {
        cache: {
          isRight: true,
          value: Symbol(),
        },
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.ConstantValue,
        value: Symbol(),
      };

      const bindingNode: PlanBindingNode = {
        binding: bindingFixture,
      };

      (serviceNode as Writable<PlanServiceNode>).bindings = bindingNode;

      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: serviceNode,
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called', () => {
      let resolveValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolveValue = Symbol();

        vitest
          .mocked(resolveConstantValueBinding)
          .mockReturnValueOnce(resolveValue);

        result = resolve(resolutionParamsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveConstantValueBinding()', () => {
        expect(resolveConstantValueBinding).toHaveBeenCalledExactlyOnceWith(
          resolutionParamsFixture,
          bindingFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolveValue);
      });
    });
  });

  describe('having ResolutionParams with plan tree with root with constant value binding array', () => {
    let resolutionParamsFixture: ResolutionParams;
    let bindingFixture: ConstantValueBinding<unknown>;

    beforeAll(() => {
      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };

      bindingFixture = {
        cache: {
          isRight: true,
          value: Symbol(),
        },
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.ConstantValue,
        value: Symbol(),
      };

      const bindingNode: PlanBindingNode = {
        binding: bindingFixture,
      };

      (serviceNode as Writable<PlanServiceNode>).bindings = [bindingNode];

      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: serviceNode,
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called', () => {
      let resolveValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolveValue = Symbol();

        vitest
          .mocked(resolveConstantValueBinding)
          .mockReturnValueOnce(resolveValue);

        result = resolve(resolutionParamsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveConstantValueBinding()', () => {
        expect(resolveConstantValueBinding).toHaveBeenCalledExactlyOnceWith(
          resolutionParamsFixture,
          bindingFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toStrictEqual([resolveValue]);
      });
    });

    describe('when called, and resolveConstantValueBinding returns a Promise value', () => {
      let resolveValue: unknown;

      let result: unknown;

      beforeAll(async () => {
        resolveValue = Symbol();

        vitest
          .mocked(resolveConstantValueBinding)
          .mockResolvedValueOnce(resolveValue);

        result = await resolve(resolutionParamsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveConstantValueBinding()', () => {
        expect(resolveConstantValueBinding).toHaveBeenCalledExactlyOnceWith(
          resolutionParamsFixture,
          bindingFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toStrictEqual([resolveValue]);
      });
    });
  });

  describe('having ResolutionParams with plan tree with root with dynamic value binding', () => {
    let resolutionParamsFixture: ResolutionParams;
    let bindingFixture: DynamicValueBinding<unknown>;

    beforeAll(() => {
      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };

      bindingFixture = {
        cache: {
          isRight: true,
          value: Symbol(),
        },
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.DynamicValue,
        value: () => Symbol(),
      };

      const bindingNode: PlanBindingNode = {
        binding: bindingFixture,
      };

      (serviceNode as Writable<PlanServiceNode>).bindings = bindingNode;

      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: serviceNode,
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called', () => {
      let resolveValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolveValue = Symbol();

        vitest
          .mocked(resolveDynamicValueBinding)
          .mockReturnValueOnce(resolveValue);

        result = resolve(resolutionParamsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveDynamicValueBinding()', () => {
        expect(resolveDynamicValueBinding).toHaveBeenCalledExactlyOnceWith(
          resolutionParamsFixture,
          bindingFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolveValue);
      });
    });
  });

  describe('having ResolutionParams with plan tree with root with factory value binding', () => {
    let resolutionParamsFixture: ResolutionParams;
    let bindingFixture: FactoryBinding<Factory<unknown>>;

    beforeAll(() => {
      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };

      bindingFixture = {
        cache: {
          isRight: false,
          value: undefined,
        },
        factory: () => () => Symbol,
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.Factory,
      };

      const bindingNode: PlanBindingNode = {
        binding: bindingFixture,
      };

      (serviceNode as Writable<PlanServiceNode>).bindings = bindingNode;

      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: serviceNode,
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called', () => {
      let resolveValue: Factory<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveValue = () => Symbol();

        vitest.mocked(resolveFactoryBinding).mockReturnValueOnce(resolveValue);

        result = resolve(resolutionParamsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveFactoryBinding()', () => {
        expect(resolveFactoryBinding).toHaveBeenCalledExactlyOnceWith(
          resolutionParamsFixture,
          bindingFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolveValue);
      });
    });
  });

  describe('having ResolutionParams with plan tree with root with instance binding', () => {
    let resolutionParamsFixture: ResolutionParams;
    let bindingNodeFixture: InstanceBindingNode;

    beforeAll(() => {
      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };

      const bindingFixture: InstanceBinding<unknown> = {
        cache: {
          isRight: true,
          value: Symbol(),
        },
        id: 1,
        implementationType: class {},
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.Instance,
      };

      bindingNodeFixture = {
        binding: bindingFixture,
        classMetadata: Symbol() as unknown as ClassMetadata,
        constructorParams: [],
        propertyParams: new Map(),
      };

      (serviceNode as Writable<PlanServiceNode>).bindings = bindingNodeFixture;

      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: serviceNode,
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called', () => {
      let resolveValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolveValue = Symbol();

        vitest
          .mocked(resolveScopedInstanceBindingNodeMock)
          .mockReturnValueOnce(resolveValue);

        result = resolve(resolutionParamsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveInstanceBindingNode()', () => {
        expect(
          resolveScopedInstanceBindingNodeMock,
        ).toHaveBeenCalledExactlyOnceWith(
          resolutionParamsFixture,
          bindingNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolveValue);
      });
    });
  });

  describe('having ResolutionParams with plan tree with root with resolved value binding', () => {
    let resolutionParamsFixture: ResolutionParams;
    let bindingNodeFixture: ResolvedValueBindingNode;

    beforeAll(() => {
      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };

      const bindingFixture: ResolvedValueBinding<unknown> = {
        cache: {
          isRight: true,
          value: Symbol(),
        },
        factory: vitest.fn(),
        id: 1,
        isSatisfiedBy: () => true,
        metadata: { arguments: [] },
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.ResolvedValue,
      };

      bindingNodeFixture = {
        binding: bindingFixture,
        params: [],
      };

      (serviceNode as Writable<PlanServiceNode>).bindings = bindingNodeFixture;

      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: serviceNode,
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called', () => {
      let resolveValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolveValue = Symbol();

        vitest
          .mocked(resolveScopedResolvedValueBindingNodeMock)
          .mockReturnValueOnce(resolveValue);

        result = resolve(resolutionParamsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveResolvedValueBindingNode()', () => {
        expect(
          resolveScopedResolvedValueBindingNodeMock,
        ).toHaveBeenCalledExactlyOnceWith(
          resolutionParamsFixture,
          bindingNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolveValue);
      });
    });
  });

  describe('having ResolutionParams with plan tree with root with provider value binding', () => {
    let resolutionParamsFixture: ResolutionParams;
    let bindingFixture: ProviderBinding<Provider<unknown>>; // eslint-disable-line @typescript-eslint/no-deprecated

    beforeAll(() => {
      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };

      bindingFixture = {
        cache: {
          isRight: false,
          value: undefined,
        },
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        provider: () => async () => Symbol(),
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.Provider,
      };

      const bindingNode: PlanBindingNode = {
        binding: bindingFixture,
      };

      (serviceNode as Writable<PlanServiceNode>).bindings = bindingNode;

      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: serviceNode,
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called', () => {
      let resolveValue: Provider<unknown>; // eslint-disable-line @typescript-eslint/no-deprecated

      let result: unknown;

      beforeAll(() => {
        resolveValue = async () => Symbol();

        vitest.mocked(resolveProviderBinding).mockReturnValueOnce(resolveValue);

        result = resolve(resolutionParamsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveProviderBinding()', () => {
        expect(resolveProviderBinding).toHaveBeenCalledExactlyOnceWith(
          resolutionParamsFixture,
          bindingFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolveValue);
      });
    });
  });

  describe('having ResolutionParams with plan tree with service redirection root with service redirection binding', () => {
    let resolutionParamsFixture: ResolutionParams;
    let serviceRedirectionBindingNodeFixture: PlanServiceRedirectionBindingNode;

    beforeAll(() => {
      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };

      const bindingFixture: ServiceRedirectionBinding<unknown> = {
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        serviceIdentifier: 'service-id',
        targetServiceIdentifier: 'target-service-id',
        type: bindingTypeValues.ServiceRedirection,
      };

      serviceRedirectionBindingNodeFixture = {
        binding: bindingFixture,
        redirections: [],
      };

      (serviceNode as Writable<PlanServiceNode>).bindings =
        serviceRedirectionBindingNodeFixture;

      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: serviceNode,
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called, and resolveServiceRedirectionBindingNode() returns an array with a single element', () => {
      let resolveValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolveValue = Symbol();

        resolveServiceRedirectionBindingNodeMock.mockReturnValueOnce([
          resolveValue,
        ]);

        result = resolve(resolutionParamsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceRedirectionBindingNode()', () => {
        expect(
          resolveServiceRedirectionBindingNodeMock,
        ).toHaveBeenCalledExactlyOnceWith(
          resolutionParamsFixture,
          serviceRedirectionBindingNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolveValue);
      });
    });

    describe('when called, and resolveServiceRedirectionBindingNode() returns an array with no elements', () => {
      let result: unknown;

      beforeAll(() => {
        resolveServiceRedirectionBindingNodeMock.mockReturnValueOnce([]);

        try {
          resolve(resolutionParamsFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceRedirectionBindingNode()', () => {
        expect(
          resolveServiceRedirectionBindingNodeMock,
        ).toHaveBeenCalledExactlyOnceWith(
          resolutionParamsFixture,
          serviceRedirectionBindingNodeFixture,
        );
      });

      it('should throw an InversifyCoreError', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.resolution,
          message: 'Unexpected multiple resolved values on single injection',
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });

  describe('having ResolutionParams with plan tree with service redirection root with service redirection binding array', () => {
    let resolutionParamsFixture: ResolutionParams;
    let serviceRedirectionBindingNodeFixture: PlanServiceRedirectionBindingNode;

    beforeAll(() => {
      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'service-id',
      };

      const bindingFixture: ServiceRedirectionBinding<unknown> = {
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        serviceIdentifier: 'service-id',
        targetServiceIdentifier: 'target-service-id',
        type: bindingTypeValues.ServiceRedirection,
      };

      serviceRedirectionBindingNodeFixture = {
        binding: bindingFixture,
        redirections: [],
      };

      (serviceNode as Writable<PlanServiceNode>).bindings = [
        serviceRedirectionBindingNodeFixture,
      ];

      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: serviceNode,
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called, and resolveServiceRedirectionBindingNode() returns an array with a single element', () => {
      let resolveValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolveValue = Symbol();

        resolveServiceRedirectionBindingNodeMock.mockReturnValueOnce([
          resolveValue,
        ]);

        result = resolve(resolutionParamsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceRedirectionBindingNode()', () => {
        expect(
          resolveServiceRedirectionBindingNodeMock,
        ).toHaveBeenCalledExactlyOnceWith(
          resolutionParamsFixture,
          serviceRedirectionBindingNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toStrictEqual([resolveValue]);
      });
    });
  });
});
