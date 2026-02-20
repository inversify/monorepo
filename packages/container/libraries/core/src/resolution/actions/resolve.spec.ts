import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock(import('./resolveConstantValueBinding.js'));
vitest.mock(import('./resolveDynamicValueBinding.js'));
vitest.mock(import('./resolveFactoryBinding.js'));
vitest.mock(import('./resolveInstanceBindingConstructorParams.js'), () => ({
  resolveInstanceBindingConstructorParams: vitest
    .fn()
    .mockReturnValue(vitest.fn()),
}));
vitest.mock(import('./resolveInstanceBindingNode.js'), () => ({
  resolveInstanceBindingNode: vitest.fn().mockReturnValue(vitest.fn()),
}));
vitest.mock(
  import('./resolveInstanceBindingNodeAsyncFromConstructorParams.js'),
  () => ({
    resolveInstanceBindingNodeAsyncFromConstructorParams: vitest
      .fn()
      .mockReturnValue(vitest.fn()),
  }),
);
vitest.mock(
  import('./resolveInstanceBindingNodeFromConstructorParams.js'),
  () => ({
    resolveInstanceBindingNodeFromConstructorParams: vitest
      .fn()
      .mockReturnValue(vitest.fn()),
  }),
);
vitest.mock(import('./resolveScopedInstanceBindingNode.js'), () => ({
  resolveScopedInstanceBindingNode: vitest.fn().mockReturnValue(vitest.fn()),
}));
vitest.mock(import('./resolveScopedResolvedValueBindingNode.js'), () => ({
  resolveScopedResolvedValueBindingNode: vitest
    .fn()
    .mockReturnValue(vitest.fn()),
}));
vitest.mock(import('./resolveServiceRedirectionBindingNode.js'), () => ({
  resolveServiceRedirectionBindingNode: vitest
    .fn()
    .mockReturnValue(vitest.fn()),
}));
vitest.mock(import('./resolveResolvedValueBindingParams.js'), () => ({
  resolveResolvedValueBindingParams: vitest.fn().mockReturnValue(vitest.fn()),
}));
vitest.mock(import('./resolveResolvedValueBindingNode.js'), () => ({
  resolveResolvedValueBindingNode: vitest.fn().mockReturnValue(vitest.fn()),
}));
vitest.mock(import('./setInstanceProperties.js'), () => ({
  setInstanceProperties: vitest.fn().mockReturnValue(vitest.fn()),
}));

import { bindingScopeValues } from '../../binding/models/BindingScope.js';
import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { type ConstantValueBinding } from '../../binding/models/ConstantValueBinding.js';
import { type DynamicValueBinding } from '../../binding/models/DynamicValueBinding.js';
import { type Factory } from '../../binding/models/Factory.js';
import { type FactoryBinding } from '../../binding/models/FactoryBinding.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding.js';
import { type Writable } from '../../common/models/Writable.js';
import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { type PlanBindingNode } from '../../planning/models/PlanBindingNode.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type PlanServiceRedirectionBindingNode } from '../../planning/models/PlanServiceRedirectionBindingNode.js';
import { type ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolve } from './resolve.js';
import { resolveConstantValueBinding } from './resolveConstantValueBinding.js';
import { resolveDynamicValueBinding } from './resolveDynamicValueBinding.js';
import { resolveFactoryBinding } from './resolveFactoryBinding.js';
import { resolveScopedInstanceBindingNode } from './resolveScopedInstanceBindingNode.js';
import { resolveScopedResolvedValueBindingNode } from './resolveScopedResolvedValueBindingNode.js';
import { resolveServiceRedirectionBindingNode } from './resolveServiceRedirectionBindingNode.js';

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
