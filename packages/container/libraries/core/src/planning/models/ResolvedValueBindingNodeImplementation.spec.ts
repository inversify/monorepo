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
  import('../calculations/buildNoActivationsResolvedValueBindingNodeResolver.js'),
);
vitest.mock(
  import('../calculations/buildNoActivationsResolvedValueBindingNodeResolverJit.js'),
);
vitest.mock(import('../../resolution/actions/resolveScoped.js'));

import { ResolvedValueBindingFixtures } from '../../binding/fixtures/ResolvedValueBindingFixtures.js';
import { type BindingActivation } from '../../binding/models/BindingActivation.js';
import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { resolveScoped } from '../../resolution/actions/resolveScoped.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { buildNoActivationsResolvedValueBindingNodeResolver } from '../calculations/buildNoActivationsResolvedValueBindingNodeResolver.js';
import { buildNoActivationsResolvedValueBindingNodeResolverJit } from '../calculations/buildNoActivationsResolvedValueBindingNodeResolverJit.js';
import { type BasePlanParams } from './BasePlanParams.js';
import { isDynamicallyResolvableBindingNodeSymbol } from './DynamicallyResolvableBindingNode.js';
import { type PlanParamsOperations } from './PlanParamsOperations.js';
import { ResolvedValueBindingNodeImplementation } from './ResolvedValueBindingNodeImplementation.js';

describe(ResolvedValueBindingNodeImplementation, () => {
  let getActivationsMock: Mock<PlanParamsOperations['getActivations']>;
  let subscribeActivationAddedOnceMock: Mock<
    PlanParamsOperations['subscribeActivationAddedOnce']
  >;

  beforeAll(() => {
    getActivationsMock = vitest.fn();
    subscribeActivationAddedOnceMock = vitest.fn();
  });

  describe('having binding with no onActivation, params with no service activations and jitEnabled false', () => {
    let bindingFixture: ResolvedValueBinding<unknown>;
    let paramsFixture: BasePlanParams;
    let resolveFixture: (params: ResolutionParams) => Resolved<unknown>;

    beforeAll(() => {
      bindingFixture = ResolvedValueBindingFixtures.withScopeSingleton;
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
      let resolvedValueBindingNodeImplementation: ResolvedValueBindingNodeImplementation;

      beforeAll(() => {
        getActivationsMock.mockReturnValueOnce(undefined);

        vitest
          .mocked(buildNoActivationsResolvedValueBindingNodeResolver)
          .mockReturnValueOnce(resolveFixture);

        resolvedValueBindingNodeImplementation =
          new ResolvedValueBindingNodeImplementation(
            bindingFixture,
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

      it('should call buildNoActivationsResolvedValueBindingNodeResolver()', () => {
        expect(
          buildNoActivationsResolvedValueBindingNodeResolver,
        ).toHaveBeenCalledExactlyOnceWith(
          resolvedValueBindingNodeImplementation,
          false,
        );
      });

      it('should not call buildNoActivationsResolvedValueBindingNodeResolverJit()', () => {
        expect(
          buildNoActivationsResolvedValueBindingNodeResolverJit,
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
          resolvedValueBindingNodeImplementation,
        );
      });

      it('should set resolve', () => {
        expect(resolvedValueBindingNodeImplementation.resolve).toBe(
          resolveFixture,
        );
      });

      it('should set params', () => {
        expect(resolvedValueBindingNodeImplementation.params).toStrictEqual([]);
      });

      it('should set isDynamicallyResolvableBindingNodeSymbol', () => {
        expect(
          resolvedValueBindingNodeImplementation[
            isDynamicallyResolvableBindingNodeSymbol
          ],
        ).toBe(true);
      });

      it('should set binding', () => {
        expect(resolvedValueBindingNodeImplementation.binding).toBe(
          bindingFixture,
        );
      });
    });
  });

  describe('having binding with no onActivation, params with no service activations, jitEnabled true and non singleton scope', () => {
    let bindingFixture: ResolvedValueBinding<unknown>;
    let paramsFixture: BasePlanParams;
    let resolveFixture: (params: ResolutionParams) => Resolved<unknown>;

    beforeAll(() => {
      bindingFixture = ResolvedValueBindingFixtures.withScopeTransient;
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
      let resolvedValueBindingNodeImplementation: ResolvedValueBindingNodeImplementation;

      beforeAll(() => {
        getActivationsMock.mockReturnValueOnce(undefined);

        vitest
          .mocked(buildNoActivationsResolvedValueBindingNodeResolverJit)
          .mockReturnValueOnce(resolveFixture);

        resolvedValueBindingNodeImplementation =
          new ResolvedValueBindingNodeImplementation(
            bindingFixture,
            paramsFixture,
          );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildNoActivationsResolvedValueBindingNodeResolverJit()', () => {
        expect(
          buildNoActivationsResolvedValueBindingNodeResolverJit,
        ).toHaveBeenCalledExactlyOnceWith(
          resolvedValueBindingNodeImplementation,
          false,
        );
      });

      it('should not call buildNoActivationsResolvedValueBindingNodeResolver()', () => {
        expect(
          buildNoActivationsResolvedValueBindingNodeResolver,
        ).not.toHaveBeenCalled();
      });

      it('should call operations.subscribeActivationAddedOnce()', () => {
        expect(
          subscribeActivationAddedOnceMock,
        ).toHaveBeenCalledExactlyOnceWith(
          bindingFixture.serviceIdentifier,
          resolvedValueBindingNodeImplementation,
        );
      });

      it('should set resolve', () => {
        expect(resolvedValueBindingNodeImplementation.resolve).toBe(
          resolveFixture,
        );
      });
    });
  });

  describe('having binding with no onActivation, params with no service activations, jitEnabled true and singleton scope', () => {
    let bindingFixture: ResolvedValueBinding<unknown>;
    let paramsFixture: BasePlanParams;
    let resolveFixture: (params: ResolutionParams) => Resolved<unknown>;

    beforeAll(() => {
      bindingFixture = ResolvedValueBindingFixtures.withScopeSingleton;
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
      let resolvedValueBindingNodeImplementation: ResolvedValueBindingNodeImplementation;

      beforeAll(() => {
        getActivationsMock.mockReturnValueOnce(undefined);

        vitest
          .mocked(buildNoActivationsResolvedValueBindingNodeResolver)
          .mockReturnValueOnce(resolveFixture);

        resolvedValueBindingNodeImplementation =
          new ResolvedValueBindingNodeImplementation(
            bindingFixture,
            paramsFixture,
          );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildNoActivationsResolvedValueBindingNodeResolver()', () => {
        expect(
          buildNoActivationsResolvedValueBindingNodeResolver,
        ).toHaveBeenCalledExactlyOnceWith(
          resolvedValueBindingNodeImplementation,
          false,
        );
      });

      it('should not call buildNoActivationsResolvedValueBindingNodeResolverJit()', () => {
        expect(
          buildNoActivationsResolvedValueBindingNodeResolverJit,
        ).not.toHaveBeenCalled();
      });

      it('should set resolve', () => {
        expect(resolvedValueBindingNodeImplementation.resolve).toBe(
          resolveFixture,
        );
      });
    });
  });

  describe('having binding with no onActivation and params with service activations', () => {
    let bindingFixture: ResolvedValueBinding<unknown>;
    let paramsFixture: BasePlanParams;
    let resolveFixture: (params: ResolutionParams) => Resolved<unknown>;
    let activationsFixture: Iterable<BindingActivation>;

    beforeAll(() => {
      bindingFixture = ResolvedValueBindingFixtures.withScopeSingleton;
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
      let resolvedValueBindingNodeImplementation: ResolvedValueBindingNodeImplementation;

      beforeAll(() => {
        getActivationsMock.mockReturnValueOnce(activationsFixture);

        vitest
          .mocked(buildNoActivationsResolvedValueBindingNodeResolver)
          .mockReturnValueOnce(resolveFixture);

        resolvedValueBindingNodeImplementation =
          new ResolvedValueBindingNodeImplementation(
            bindingFixture,
            paramsFixture,
          );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildNoActivationsResolvedValueBindingNodeResolver()', () => {
        expect(
          buildNoActivationsResolvedValueBindingNodeResolver,
        ).toHaveBeenCalledExactlyOnceWith(
          resolvedValueBindingNodeImplementation,
          true,
        );
      });

      it('should not call operations.subscribeActivationAddedOnce()', () => {
        expect(subscribeActivationAddedOnceMock).not.toHaveBeenCalled();
      });

      it('should set resolve', () => {
        expect(resolvedValueBindingNodeImplementation.resolve).toBe(
          resolveFixture,
        );
      });
    });
  });

  describe('having binding with onActivation', () => {
    let bindingFixture: ResolvedValueBinding<unknown>;
    let paramsFixture: BasePlanParams;
    let resolveFixture: (params: ResolutionParams) => Resolved<unknown>;

    beforeAll(() => {
      bindingFixture = ResolvedValueBindingFixtures.withOnActivation;
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
      let resolvedValueBindingNodeImplementation: ResolvedValueBindingNodeImplementation;

      beforeAll(() => {
        getActivationsMock.mockReturnValueOnce(undefined);

        vitest.mocked(resolveScoped).mockReturnValueOnce(resolveFixture);

        resolvedValueBindingNodeImplementation =
          new ResolvedValueBindingNodeImplementation(
            bindingFixture,
            paramsFixture,
          );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveScoped()', () => {
        expect(resolveScoped).toHaveBeenCalledExactlyOnceWith(
          resolvedValueBindingNodeImplementation,
          expect.any(Function),
        );
      });

      it('should not call buildNoActivationsResolvedValueBindingNodeResolver()', () => {
        expect(
          buildNoActivationsResolvedValueBindingNodeResolver,
        ).not.toHaveBeenCalled();
      });

      it('should not call buildNoActivationsResolvedValueBindingNodeResolverJit()', () => {
        expect(
          buildNoActivationsResolvedValueBindingNodeResolverJit,
        ).not.toHaveBeenCalled();
      });

      it('should not call operations.subscribeActivationAddedOnce()', () => {
        expect(subscribeActivationAddedOnceMock).not.toHaveBeenCalled();
      });

      it('should set resolve', () => {
        expect(resolvedValueBindingNodeImplementation.resolve).toBe(
          resolveFixture,
        );
      });
    });
  });

  describe('.addOnResolverChangedHandler', () => {
    describe('having ResolvedValueBindingNodeImplementation', () => {
      let bindingFixture: ResolvedValueBinding<unknown>;
      let paramsFixture: BasePlanParams;
      let callbackFixture: Mock<
        (newResolver: (params: ResolutionParams) => Resolved<unknown>) => void
      >;

      beforeAll(() => {
        bindingFixture = ResolvedValueBindingFixtures.withScopeSingleton;
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
        let resolvedValueBindingNodeImplementation: ResolvedValueBindingNodeImplementation;

        let result: unknown;

        beforeAll(() => {
          getActivationsMock.mockReturnValueOnce(undefined);

          vitest
            .mocked(buildNoActivationsResolvedValueBindingNodeResolver)
            .mockReturnValueOnce(vitest.fn());

          resolvedValueBindingNodeImplementation =
            new ResolvedValueBindingNodeImplementation(
              bindingFixture,
              paramsFixture,
            );

          result =
            resolvedValueBindingNodeImplementation.addOnResolverChangedHandler(
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
    describe('having ResolvedValueBindingNodeImplementation with no onActivation and no service activations', () => {
      let bindingFixture: ResolvedValueBinding<unknown>;
      let paramsFixture: BasePlanParams;
      let initialResolveFixture: (
        params: ResolutionParams,
      ) => Resolved<unknown>;
      let updatedResolveFixture: (
        params: ResolutionParams,
      ) => Resolved<unknown>;

      beforeAll(() => {
        bindingFixture = ResolvedValueBindingFixtures.withScopeSingleton;
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
        let resolvedValueBindingNodeImplementation: ResolvedValueBindingNodeImplementation;

        let result: unknown;

        beforeAll(() => {
          getActivationsMock.mockReturnValueOnce(undefined);

          vitest
            .mocked(buildNoActivationsResolvedValueBindingNodeResolver)
            .mockReturnValueOnce(initialResolveFixture);

          resolvedValueBindingNodeImplementation =
            new ResolvedValueBindingNodeImplementation(
              bindingFixture,
              paramsFixture,
            );

          vitest.clearAllMocks();

          vitest
            .mocked(buildNoActivationsResolvedValueBindingNodeResolver)
            .mockReturnValueOnce(updatedResolveFixture);

          result = resolvedValueBindingNodeImplementation.onActivationAdded();
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call buildNoActivationsResolvedValueBindingNodeResolver()', () => {
          expect(
            buildNoActivationsResolvedValueBindingNodeResolver,
          ).toHaveBeenCalledExactlyOnceWith(
            resolvedValueBindingNodeImplementation,
            true,
          );
        });

        it('should update resolve', () => {
          expect(resolvedValueBindingNodeImplementation.resolve).toBe(
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
        let resolvedValueBindingNodeImplementation: ResolvedValueBindingNodeImplementation;

        let result: unknown;

        beforeAll(() => {
          callbackMock = vitest.fn();

          getActivationsMock.mockReturnValueOnce(undefined);

          vitest
            .mocked(buildNoActivationsResolvedValueBindingNodeResolver)
            .mockReturnValueOnce(initialResolveFixture);

          resolvedValueBindingNodeImplementation =
            new ResolvedValueBindingNodeImplementation(
              bindingFixture,
              paramsFixture,
            );

          resolvedValueBindingNodeImplementation.addOnResolverChangedHandler(
            callbackMock,
          );

          vitest.clearAllMocks();

          vitest
            .mocked(buildNoActivationsResolvedValueBindingNodeResolver)
            .mockReturnValueOnce(updatedResolveFixture);

          result = resolvedValueBindingNodeImplementation.onActivationAdded();
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call buildNoActivationsResolvedValueBindingNodeResolver()', () => {
          expect(
            buildNoActivationsResolvedValueBindingNodeResolver,
          ).toHaveBeenCalledExactlyOnceWith(
            resolvedValueBindingNodeImplementation,
            true,
          );
        });

        it('should call callback()', () => {
          expect(callbackMock).toHaveBeenCalledExactlyOnceWith(
            updatedResolveFixture,
          );
        });

        it('should update resolve', () => {
          expect(resolvedValueBindingNodeImplementation.resolve).toBe(
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
