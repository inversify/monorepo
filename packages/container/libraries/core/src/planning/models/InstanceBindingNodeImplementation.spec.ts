import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock(
  import('../calculations/buildNoActivationsInstanceBindingNodeResolver.js'),
);
vitest.mock(
  import('../calculations/buildNoActivationsInstanceBindingNodeResolverJit.js'),
);
vitest.mock(import('../../resolution/actions/resolveScoped.js'));

import { InstanceBindingFixtures } from '../../binding/fixtures/InstanceBindingFixtures.js';
import { type BindingActivation } from '../../binding/models/BindingActivation.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { ClassMetadataFixtures } from '../../metadata/fixtures/ClassMetadataFixtures.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { resolveScoped } from '../../resolution/actions/resolveScoped.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { buildNoActivationsInstanceBindingNodeResolver } from '../calculations/buildNoActivationsInstanceBindingNodeResolver.js';
import { buildNoActivationsInstanceBindingNodeResolverJit } from '../calculations/buildNoActivationsInstanceBindingNodeResolverJit.js';
import { type BasePlanParams } from './BasePlanParams.js';
import { isDynamicallyResolvableBindingNodeSymbol } from './DynamicallyResolvableBindingNode.js';
import { InstanceBindingNodeImplementation } from './InstanceBindingNodeImplementation.js';
import { type PlanParamsOperations } from './PlanParamsOperations.js';

describe(InstanceBindingNodeImplementation, () => {
  let getActivationsMock: Mock<PlanParamsOperations['getActivations']>;
  let subscribeActivationAddedOnceMock: Mock<
    PlanParamsOperations['subscribeActivationAddedOnce']
  >;

  beforeAll(() => {
    getActivationsMock = vitest.fn();
    subscribeActivationAddedOnceMock = vitest.fn();
  });

  describe('having binding with no onActivation, classMetadata with no postConstructMethodNames, params with no service activations and jitEnabled false', () => {
    let bindingFixture: InstanceBinding<unknown>;
    let classMetadataFixture: ClassMetadata;
    let paramsFixture: BasePlanParams;
    let resolveFixture: (params: ResolutionParams) => Resolved<unknown>;

    beforeAll(() => {
      bindingFixture = InstanceBindingFixtures.withScopeSingleton;
      classMetadataFixture = ClassMetadataFixtures.any;
      paramsFixture = {
        autobindOptions: undefined,
        jitEnabled: false,
        operations: {
          getActivations: getActivationsMock,
          subscribeActivationAddedOnce: subscribeActivationAddedOnceMock,
        } as Partial<PlanParamsOperations> as PlanParamsOperations,
        servicesBranch: [],
      };
      resolveFixture = vitest.fn();
    });

    describe('when called', () => {
      let instanceBindingNodeImplementation: InstanceBindingNodeImplementation;

      beforeAll(() => {
        getActivationsMock.mockReturnValueOnce(undefined);

        vitest
          .mocked(buildNoActivationsInstanceBindingNodeResolver)
          .mockReturnValueOnce(resolveFixture);

        instanceBindingNodeImplementation =
          new InstanceBindingNodeImplementation(
            bindingFixture,
            classMetadataFixture,
            paramsFixture,
          );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call operations.getActivations()', () => {
        expect(getActivationsMock).toHaveBeenCalledExactlyOnceWith(
          bindingFixture.serviceIdentifier,
        );
      });

      it('should call buildNoActivationsInstanceBindingNodeResolver()', () => {
        expect(
          buildNoActivationsInstanceBindingNodeResolver,
        ).toHaveBeenCalledExactlyOnceWith(
          instanceBindingNodeImplementation,
          false,
        );
      });

      it('should not call buildNoActivationsInstanceBindingNodeResolverJit()', () => {
        expect(
          buildNoActivationsInstanceBindingNodeResolverJit,
        ).not.toHaveBeenCalled();
      });

      it('should not call resolveScoped()', () => {
        expect(resolveScoped).not.toHaveBeenCalled();
      });

      it('should call operations.subscribeActivationAddedOnce()', () => {
        expect(
          subscribeActivationAddedOnceMock,
        ).toHaveBeenCalledExactlyOnceWith(
          bindingFixture.serviceIdentifier,
          instanceBindingNodeImplementation,
        );
      });

      it('should set resolve', () => {
        expect(instanceBindingNodeImplementation.resolve).toBe(resolveFixture);
      });

      it('should set constructorParams', () => {
        expect(
          instanceBindingNodeImplementation.constructorParams,
        ).toStrictEqual([]);
      });

      it('should set propertyParams', () => {
        expect(instanceBindingNodeImplementation.propertyParams).toStrictEqual(
          new Map(),
        );
      });

      it('should set isDynamicallyResolvableBindingNodeSymbol', () => {
        expect(
          instanceBindingNodeImplementation[
            isDynamicallyResolvableBindingNodeSymbol
          ],
        ).toBe(true);
      });

      it('should set binding', () => {
        expect(instanceBindingNodeImplementation.binding).toBe(bindingFixture);
      });

      it('should set classMetadata', () => {
        expect(instanceBindingNodeImplementation.classMetadata).toBe(
          classMetadataFixture,
        );
      });
    });
  });

  describe('having binding with no onActivation, classMetadata with no postConstructMethodNames, params with no service activations, jitEnabled true and non singleton scope', () => {
    let bindingFixture: InstanceBinding<unknown>;
    let classMetadataFixture: ClassMetadata;
    let paramsFixture: BasePlanParams;
    let resolveFixture: (params: ResolutionParams) => Resolved<unknown>;

    beforeAll(() => {
      bindingFixture = InstanceBindingFixtures.withScopeTransient;
      classMetadataFixture = ClassMetadataFixtures.any;
      paramsFixture = {
        autobindOptions: undefined,
        jitEnabled: true,
        operations: {
          getActivations: getActivationsMock,
          subscribeActivationAddedOnce: subscribeActivationAddedOnceMock,
        } as Partial<PlanParamsOperations> as PlanParamsOperations,
        servicesBranch: [],
      };
      resolveFixture = vitest.fn();
    });

    describe('when called', () => {
      let instanceBindingNodeImplementation: InstanceBindingNodeImplementation;

      beforeAll(() => {
        getActivationsMock.mockReturnValueOnce(undefined);

        vitest
          .mocked(buildNoActivationsInstanceBindingNodeResolverJit)
          .mockReturnValueOnce(resolveFixture);

        instanceBindingNodeImplementation =
          new InstanceBindingNodeImplementation(
            bindingFixture,
            classMetadataFixture,
            paramsFixture,
          );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildNoActivationsInstanceBindingNodeResolverJit()', () => {
        expect(
          buildNoActivationsInstanceBindingNodeResolverJit,
        ).toHaveBeenCalledExactlyOnceWith(
          instanceBindingNodeImplementation,
          false,
        );
      });

      it('should not call buildNoActivationsInstanceBindingNodeResolver()', () => {
        expect(
          buildNoActivationsInstanceBindingNodeResolver,
        ).not.toHaveBeenCalled();
      });

      it('should call operations.subscribeActivationAddedOnce()', () => {
        expect(
          subscribeActivationAddedOnceMock,
        ).toHaveBeenCalledExactlyOnceWith(
          bindingFixture.serviceIdentifier,
          instanceBindingNodeImplementation,
        );
      });

      it('should set resolve', () => {
        expect(instanceBindingNodeImplementation.resolve).toBe(resolveFixture);
      });
    });
  });

  describe('having binding with no onActivation, classMetadata with no postConstructMethodNames, params with no service activations, jitEnabled true and singleton scope', () => {
    let bindingFixture: InstanceBinding<unknown>;
    let classMetadataFixture: ClassMetadata;
    let paramsFixture: BasePlanParams;
    let resolveFixture: (params: ResolutionParams) => Resolved<unknown>;

    beforeAll(() => {
      bindingFixture = InstanceBindingFixtures.withScopeSingleton;
      classMetadataFixture = ClassMetadataFixtures.any;
      paramsFixture = {
        autobindOptions: undefined,
        jitEnabled: true,
        operations: {
          getActivations: getActivationsMock,
          subscribeActivationAddedOnce: subscribeActivationAddedOnceMock,
        } as Partial<PlanParamsOperations> as PlanParamsOperations,
        servicesBranch: [],
      };
      resolveFixture = vitest.fn();
    });

    describe('when called', () => {
      let instanceBindingNodeImplementation: InstanceBindingNodeImplementation;

      beforeAll(() => {
        getActivationsMock.mockReturnValueOnce(undefined);

        vitest
          .mocked(buildNoActivationsInstanceBindingNodeResolver)
          .mockReturnValueOnce(resolveFixture);

        instanceBindingNodeImplementation =
          new InstanceBindingNodeImplementation(
            bindingFixture,
            classMetadataFixture,
            paramsFixture,
          );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildNoActivationsInstanceBindingNodeResolver()', () => {
        expect(
          buildNoActivationsInstanceBindingNodeResolver,
        ).toHaveBeenCalledExactlyOnceWith(
          instanceBindingNodeImplementation,
          false,
        );
      });

      it('should not call buildNoActivationsInstanceBindingNodeResolverJit()', () => {
        expect(
          buildNoActivationsInstanceBindingNodeResolverJit,
        ).not.toHaveBeenCalled();
      });

      it('should set resolve', () => {
        expect(instanceBindingNodeImplementation.resolve).toBe(resolveFixture);
      });
    });
  });

  describe('having binding with no onActivation, classMetadata with no postConstructMethodNames and params with service activations', () => {
    let bindingFixture: InstanceBinding<unknown>;
    let classMetadataFixture: ClassMetadata;
    let paramsFixture: BasePlanParams;
    let resolveFixture: (params: ResolutionParams) => Resolved<unknown>;
    let activationsFixture: Iterable<BindingActivation>;

    beforeAll(() => {
      bindingFixture = InstanceBindingFixtures.withScopeSingleton;
      classMetadataFixture = ClassMetadataFixtures.any;
      paramsFixture = {
        autobindOptions: undefined,
        jitEnabled: false,
        operations: {
          getActivations: getActivationsMock,
          subscribeActivationAddedOnce: subscribeActivationAddedOnceMock,
        } as Partial<PlanParamsOperations> as PlanParamsOperations,
        servicesBranch: [],
      };
      resolveFixture = vitest.fn();
      activationsFixture = [() => undefined];
    });

    describe('when called', () => {
      let instanceBindingNodeImplementation: InstanceBindingNodeImplementation;

      beforeAll(() => {
        getActivationsMock.mockReturnValueOnce(activationsFixture);

        vitest
          .mocked(buildNoActivationsInstanceBindingNodeResolver)
          .mockReturnValueOnce(resolveFixture);

        instanceBindingNodeImplementation =
          new InstanceBindingNodeImplementation(
            bindingFixture,
            classMetadataFixture,
            paramsFixture,
          );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildNoActivationsInstanceBindingNodeResolver()', () => {
        expect(
          buildNoActivationsInstanceBindingNodeResolver,
        ).toHaveBeenCalledExactlyOnceWith(
          instanceBindingNodeImplementation,
          true,
        );
      });

      it('should not call operations.subscribeActivationAddedOnce()', () => {
        expect(subscribeActivationAddedOnceMock).not.toHaveBeenCalled();
      });

      it('should set resolve', () => {
        expect(instanceBindingNodeImplementation.resolve).toBe(resolveFixture);
      });
    });
  });

  describe('having binding with onActivation and classMetadata with no postConstructMethodNames', () => {
    let bindingFixture: InstanceBinding<unknown>;
    let classMetadataFixture: ClassMetadata;
    let paramsFixture: BasePlanParams;
    let resolveFixture: (params: ResolutionParams) => Resolved<unknown>;

    beforeAll(() => {
      bindingFixture = {
        ...InstanceBindingFixtures.withScopeSingleton,
        onActivation: () => undefined,
      };
      classMetadataFixture = ClassMetadataFixtures.any;
      paramsFixture = {
        autobindOptions: undefined,
        jitEnabled: false,
        operations: {
          getActivations: getActivationsMock,
          subscribeActivationAddedOnce: subscribeActivationAddedOnceMock,
        } as Partial<PlanParamsOperations> as PlanParamsOperations,
        servicesBranch: [],
      };
      resolveFixture = vitest.fn();
    });

    describe('when called', () => {
      let instanceBindingNodeImplementation: InstanceBindingNodeImplementation;

      beforeAll(() => {
        getActivationsMock.mockReturnValueOnce(undefined);

        vitest.mocked(resolveScoped).mockReturnValueOnce(resolveFixture);

        instanceBindingNodeImplementation =
          new InstanceBindingNodeImplementation(
            bindingFixture,
            classMetadataFixture,
            paramsFixture,
          );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveScoped()', () => {
        expect(resolveScoped).toHaveBeenCalledExactlyOnceWith(
          instanceBindingNodeImplementation,
          expect.any(Function),
        );
      });

      it('should not call buildNoActivationsInstanceBindingNodeResolver()', () => {
        expect(
          buildNoActivationsInstanceBindingNodeResolver,
        ).not.toHaveBeenCalled();
      });

      it('should not call buildNoActivationsInstanceBindingNodeResolverJit()', () => {
        expect(
          buildNoActivationsInstanceBindingNodeResolverJit,
        ).not.toHaveBeenCalled();
      });

      it('should not call operations.subscribeActivationAddedOnce()', () => {
        expect(subscribeActivationAddedOnceMock).not.toHaveBeenCalled();
      });

      it('should set resolve', () => {
        expect(instanceBindingNodeImplementation.resolve).toBe(resolveFixture);
      });
    });
  });

  describe('having binding with no onActivation and classMetadata with postConstructMethodNames', () => {
    let bindingFixture: InstanceBinding<unknown>;
    let classMetadataFixture: ClassMetadata;
    let paramsFixture: BasePlanParams;
    let resolveFixture: (params: ResolutionParams) => Resolved<unknown>;

    beforeAll(() => {
      bindingFixture = InstanceBindingFixtures.withScopeSingleton;
      classMetadataFixture = {
        ...ClassMetadataFixtures.any,
        lifecycle: {
          postConstructMethodNames: new Set(['postConstruct']),
          preDestroyMethodNames: new Set(),
        },
      };
      paramsFixture = {
        autobindOptions: undefined,
        jitEnabled: false,
        operations: {
          getActivations: getActivationsMock,
          subscribeActivationAddedOnce: subscribeActivationAddedOnceMock,
        } as Partial<PlanParamsOperations> as PlanParamsOperations,
        servicesBranch: [],
      };
      resolveFixture = vitest.fn();
    });

    describe('when called', () => {
      let instanceBindingNodeImplementation: InstanceBindingNodeImplementation;

      beforeAll(() => {
        getActivationsMock.mockReturnValueOnce(undefined);

        vitest.mocked(resolveScoped).mockReturnValueOnce(resolveFixture);

        instanceBindingNodeImplementation =
          new InstanceBindingNodeImplementation(
            bindingFixture,
            classMetadataFixture,
            paramsFixture,
          );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveScoped()', () => {
        expect(resolveScoped).toHaveBeenCalledExactlyOnceWith(
          instanceBindingNodeImplementation,
          expect.any(Function),
        );
      });

      it('should not call buildNoActivationsInstanceBindingNodeResolver()', () => {
        expect(
          buildNoActivationsInstanceBindingNodeResolver,
        ).not.toHaveBeenCalled();
      });

      it('should not call operations.subscribeActivationAddedOnce()', () => {
        expect(subscribeActivationAddedOnceMock).not.toHaveBeenCalled();
      });

      it('should set resolve', () => {
        expect(instanceBindingNodeImplementation.resolve).toBe(resolveFixture);
      });
    });
  });

  describe('.addOnResolverChangedHandler', () => {
    describe('having InstanceBindingNodeImplementation', () => {
      let bindingFixture: InstanceBinding<unknown>;
      let classMetadataFixture: ClassMetadata;
      let paramsFixture: BasePlanParams;
      let callbackFixture: Mock<
        (newResolver: (params: ResolutionParams) => Resolved<unknown>) => void
      >;

      beforeAll(() => {
        bindingFixture = InstanceBindingFixtures.withScopeSingleton;
        classMetadataFixture = ClassMetadataFixtures.any;
        paramsFixture = {
          autobindOptions: undefined,
          jitEnabled: false,
          operations: {
            getActivations: getActivationsMock,
            subscribeActivationAddedOnce: subscribeActivationAddedOnceMock,
          } as Partial<PlanParamsOperations> as PlanParamsOperations,
          servicesBranch: [],
        };
        callbackFixture = vitest.fn();
      });

      describe('when called', () => {
        let instanceBindingNodeImplementation: InstanceBindingNodeImplementation;

        let result: unknown;

        beforeAll(() => {
          getActivationsMock.mockReturnValueOnce(undefined);

          vitest
            .mocked(buildNoActivationsInstanceBindingNodeResolver)
            .mockReturnValueOnce(vitest.fn());

          instanceBindingNodeImplementation =
            new InstanceBindingNodeImplementation(
              bindingFixture,
              classMetadataFixture,
              paramsFixture,
            );

          result =
            instanceBindingNodeImplementation.addOnResolverChangedHandler(
              callbackFixture,
            );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  });

  describe('.onActivationAdded', () => {
    describe('having InstanceBindingNodeImplementation with no onActivation, no postConstructMethodNames and no service activations', () => {
      let bindingFixture: InstanceBinding<unknown>;
      let classMetadataFixture: ClassMetadata;
      let paramsFixture: BasePlanParams;
      let initialResolveFixture: (
        params: ResolutionParams,
      ) => Resolved<unknown>;
      let updatedResolveFixture: (
        params: ResolutionParams,
      ) => Resolved<unknown>;

      beforeAll(() => {
        bindingFixture = InstanceBindingFixtures.withScopeSingleton;
        classMetadataFixture = ClassMetadataFixtures.any;
        paramsFixture = {
          autobindOptions: undefined,
          jitEnabled: false,
          operations: {
            getActivations: getActivationsMock,
            subscribeActivationAddedOnce: subscribeActivationAddedOnceMock,
          } as Partial<PlanParamsOperations> as PlanParamsOperations,
          servicesBranch: [],
        };
        initialResolveFixture = vitest.fn();
        updatedResolveFixture = vitest.fn();
      });

      describe('when called', () => {
        let instanceBindingNodeImplementation: InstanceBindingNodeImplementation;

        let result: unknown;

        beforeAll(() => {
          getActivationsMock.mockReturnValueOnce(undefined);

          vitest
            .mocked(buildNoActivationsInstanceBindingNodeResolver)
            .mockReturnValueOnce(initialResolveFixture);

          instanceBindingNodeImplementation =
            new InstanceBindingNodeImplementation(
              bindingFixture,
              classMetadataFixture,
              paramsFixture,
            );

          vitest.clearAllMocks();

          vitest
            .mocked(buildNoActivationsInstanceBindingNodeResolver)
            .mockReturnValueOnce(updatedResolveFixture);

          result = instanceBindingNodeImplementation.onActivationAdded();
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call buildNoActivationsInstanceBindingNodeResolver()', () => {
          expect(
            buildNoActivationsInstanceBindingNodeResolver,
          ).toHaveBeenCalledExactlyOnceWith(
            instanceBindingNodeImplementation,
            true,
          );
        });

        it('should update resolve', () => {
          expect(instanceBindingNodeImplementation.resolve).toBe(
            updatedResolveFixture,
          );
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });

      describe('when called, and addOnResolverChangedHandler was previously called', () => {
        let callbackMock: Mock<
          (newResolver: (params: ResolutionParams) => Resolved<unknown>) => void
        >;
        let instanceBindingNodeImplementation: InstanceBindingNodeImplementation;

        let result: unknown;

        beforeAll(() => {
          callbackMock = vitest.fn();

          getActivationsMock.mockReturnValueOnce(undefined);

          vitest
            .mocked(buildNoActivationsInstanceBindingNodeResolver)
            .mockReturnValueOnce(initialResolveFixture);

          instanceBindingNodeImplementation =
            new InstanceBindingNodeImplementation(
              bindingFixture,
              classMetadataFixture,
              paramsFixture,
            );

          instanceBindingNodeImplementation.addOnResolverChangedHandler(
            callbackMock,
          );

          vitest.clearAllMocks();

          vitest
            .mocked(buildNoActivationsInstanceBindingNodeResolver)
            .mockReturnValueOnce(updatedResolveFixture);

          result = instanceBindingNodeImplementation.onActivationAdded();
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call buildNoActivationsInstanceBindingNodeResolver()', () => {
          expect(
            buildNoActivationsInstanceBindingNodeResolver,
          ).toHaveBeenCalledExactlyOnceWith(
            instanceBindingNodeImplementation,
            true,
          );
        });

        it('should call callback()', () => {
          expect(callbackMock).toHaveBeenCalledExactlyOnceWith(
            updatedResolveFixture,
          );
        });

        it('should update resolve', () => {
          expect(instanceBindingNodeImplementation.resolve).toBe(
            updatedResolveFixture,
          );
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  });
});
