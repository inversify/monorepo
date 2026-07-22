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
  import('../calculations/buildNoActivationsDynamicValueBindingNodeResolver.js'),
);
vitest.mock(import('../../resolution/actions/resolveScoped.js'));

import { DynamicValueBindingFixtures } from '../../binding/fixtures/DynamicValueBindingFixtures.js';
import { type BindingActivation } from '../../binding/models/BindingActivation.js';
import { type DynamicValueBinding } from '../../binding/models/DynamicValueBinding.js';
import { resolveScoped } from '../../resolution/actions/resolveScoped.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { buildNoActivationsDynamicValueBindingNodeResolver } from '../calculations/buildNoActivationsDynamicValueBindingNodeResolver.js';
import { type BasePlanParams } from './BasePlanParams.js';
import { isDynamicallyResolvableBindingNodeSymbol } from './DynamicallyResolvableBindingNode.js';
import { DynamicValueBindingNode } from './DynamicValueBindingNode.js';
import { type PlanParamsOperations } from './PlanParamsOperations.js';

describe(DynamicValueBindingNode, () => {
  let getActivationsMock: Mock<PlanParamsOperations['getActivations']>;
  let subscribeActivationAddedOnceMock: Mock<
    PlanParamsOperations['subscribeActivationAddedOnce']
  >;

  beforeAll(() => {
    getActivationsMock = vitest.fn();
    subscribeActivationAddedOnceMock = vitest.fn();
  });

  describe('having binding with no onActivation and params with no service activations', () => {
    let bindingFixture: DynamicValueBinding<unknown>;
    let paramsFixture: BasePlanParams;
    let resolveFixture: (params: ResolutionParams) => Resolved<unknown>;

    beforeAll(() => {
      bindingFixture = DynamicValueBindingFixtures.withScopeSingleton;
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
      let dynamicValueBindingNode: DynamicValueBindingNode;

      beforeAll(() => {
        getActivationsMock.mockReturnValueOnce(undefined);

        vitest
          .mocked(buildNoActivationsDynamicValueBindingNodeResolver)
          .mockReturnValueOnce(resolveFixture);

        dynamicValueBindingNode = new DynamicValueBindingNode(
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

      it('should call buildNoActivationsDynamicValueBindingNodeResolver()', () => {
        expect(
          buildNoActivationsDynamicValueBindingNodeResolver,
        ).toHaveBeenCalledExactlyOnceWith(dynamicValueBindingNode, false);
      });

      it('should not call resolveScoped()', () => {
        expect(resolveScoped).not.toHaveBeenCalled();
      });

      it('should call operations.subscribeActivationAddedOnce()', () => {
        expect(
          subscribeActivationAddedOnceMock,
        ).toHaveBeenCalledExactlyOnceWith(
          bindingFixture.serviceIdentifier,
          dynamicValueBindingNode,
        );
      });

      it('should set resolve', () => {
        expect(dynamicValueBindingNode.resolve).toBe(resolveFixture);
      });

      it('should set isDynamicallyResolvableBindingNodeSymbol', () => {
        expect(
          dynamicValueBindingNode[isDynamicallyResolvableBindingNodeSymbol],
        ).toBe(true);
      });

      it('should set binding', () => {
        expect(dynamicValueBindingNode.binding).toBe(bindingFixture);
      });
    });
  });

  describe('having binding with no onActivation and params with service activations', () => {
    let bindingFixture: DynamicValueBinding<unknown>;
    let paramsFixture: BasePlanParams;
    let resolveFixture: (params: ResolutionParams) => Resolved<unknown>;
    let activationsFixture: Iterable<BindingActivation>;

    beforeAll(() => {
      bindingFixture = DynamicValueBindingFixtures.withScopeSingleton;
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
      let dynamicValueBindingNode: DynamicValueBindingNode;

      beforeAll(() => {
        getActivationsMock.mockReturnValueOnce(activationsFixture);

        vitest
          .mocked(buildNoActivationsDynamicValueBindingNodeResolver)
          .mockReturnValueOnce(resolveFixture);

        dynamicValueBindingNode = new DynamicValueBindingNode(
          bindingFixture,
          paramsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildNoActivationsDynamicValueBindingNodeResolver()', () => {
        expect(
          buildNoActivationsDynamicValueBindingNodeResolver,
        ).toHaveBeenCalledExactlyOnceWith(dynamicValueBindingNode, true);
      });

      it('should not call operations.subscribeActivationAddedOnce()', () => {
        expect(subscribeActivationAddedOnceMock).not.toHaveBeenCalled();
      });

      it('should set resolve', () => {
        expect(dynamicValueBindingNode.resolve).toBe(resolveFixture);
      });
    });
  });

  describe('having binding with onActivation', () => {
    let bindingFixture: DynamicValueBinding<unknown>;
    let paramsFixture: BasePlanParams;
    let resolveFixture: (params: ResolutionParams) => Resolved<unknown>;

    beforeAll(() => {
      bindingFixture = DynamicValueBindingFixtures.withOnActivation;
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
      let dynamicValueBindingNode: DynamicValueBindingNode;

      beforeAll(() => {
        getActivationsMock.mockReturnValueOnce(undefined);

        vitest.mocked(resolveScoped).mockReturnValueOnce(resolveFixture);

        dynamicValueBindingNode = new DynamicValueBindingNode(
          bindingFixture,
          paramsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveScoped()', () => {
        expect(resolveScoped).toHaveBeenCalledExactlyOnceWith(
          dynamicValueBindingNode,
          expect.any(Function),
        );
      });

      it('should not call buildNoActivationsDynamicValueBindingNodeResolver()', () => {
        expect(
          buildNoActivationsDynamicValueBindingNodeResolver,
        ).not.toHaveBeenCalled();
      });

      it('should not call operations.subscribeActivationAddedOnce()', () => {
        expect(subscribeActivationAddedOnceMock).not.toHaveBeenCalled();
      });

      it('should set resolve', () => {
        expect(dynamicValueBindingNode.resolve).toBe(resolveFixture);
      });
    });
  });

  describe('.addOnResolverChangedHandler', () => {
    describe('having DynamicValueBindingNode', () => {
      let bindingFixture: DynamicValueBinding<unknown>;
      let paramsFixture: BasePlanParams;
      let callbackFixture: Mock<
        (newResolver: (params: ResolutionParams) => Resolved<unknown>) => void
      >;

      beforeAll(() => {
        bindingFixture = DynamicValueBindingFixtures.withScopeSingleton;
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
        let dynamicValueBindingNode: DynamicValueBindingNode;

        let result: unknown;

        beforeAll(() => {
          getActivationsMock.mockReturnValueOnce(undefined);

          vitest
            .mocked(buildNoActivationsDynamicValueBindingNodeResolver)
            .mockReturnValueOnce(vitest.fn());

          dynamicValueBindingNode = new DynamicValueBindingNode(
            bindingFixture,
            paramsFixture,
          );

          result =
            dynamicValueBindingNode.addOnResolverChangedHandler(
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
    describe('having DynamicValueBindingNode with no onActivation and no service activations', () => {
      let bindingFixture: DynamicValueBinding<unknown>;
      let paramsFixture: BasePlanParams;
      let initialResolveFixture: (
        params: ResolutionParams,
      ) => Resolved<unknown>;
      let updatedResolveFixture: (
        params: ResolutionParams,
      ) => Resolved<unknown>;

      beforeAll(() => {
        bindingFixture = DynamicValueBindingFixtures.withScopeSingleton;
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
        let dynamicValueBindingNode: DynamicValueBindingNode;

        let result: unknown;

        beforeAll(() => {
          getActivationsMock.mockReturnValueOnce(undefined);

          vitest
            .mocked(buildNoActivationsDynamicValueBindingNodeResolver)
            .mockReturnValueOnce(initialResolveFixture);

          dynamicValueBindingNode = new DynamicValueBindingNode(
            bindingFixture,
            paramsFixture,
          );

          vitest.clearAllMocks();

          vitest
            .mocked(buildNoActivationsDynamicValueBindingNodeResolver)
            .mockReturnValueOnce(updatedResolveFixture);

          result = dynamicValueBindingNode.onActivationAdded();
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call buildNoActivationsDynamicValueBindingNodeResolver()', () => {
          expect(
            buildNoActivationsDynamicValueBindingNodeResolver,
          ).toHaveBeenCalledExactlyOnceWith(dynamicValueBindingNode, true);
        });

        it('should update resolve', () => {
          expect(dynamicValueBindingNode.resolve).toBe(updatedResolveFixture);
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });

      describe('when called, and addOnResolverChangedHandler was previously called', () => {
        let callbackMock: Mock<
          (newResolver: (params: ResolutionParams) => Resolved<unknown>) => void
        >;
        let dynamicValueBindingNode: DynamicValueBindingNode;

        let result: unknown;

        beforeAll(() => {
          callbackMock = vitest.fn();

          getActivationsMock.mockReturnValueOnce(undefined);

          vitest
            .mocked(buildNoActivationsDynamicValueBindingNodeResolver)
            .mockReturnValueOnce(initialResolveFixture);

          dynamicValueBindingNode = new DynamicValueBindingNode(
            bindingFixture,
            paramsFixture,
          );

          dynamicValueBindingNode.addOnResolverChangedHandler(callbackMock);

          vitest.clearAllMocks();

          vitest
            .mocked(buildNoActivationsDynamicValueBindingNodeResolver)
            .mockReturnValueOnce(updatedResolveFixture);

          result = dynamicValueBindingNode.onActivationAdded();
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call buildNoActivationsDynamicValueBindingNodeResolver()', () => {
          expect(
            buildNoActivationsDynamicValueBindingNodeResolver,
          ).toHaveBeenCalledExactlyOnceWith(dynamicValueBindingNode, true);
        });

        it('should call callback()', () => {
          expect(callbackMock).toHaveBeenCalledExactlyOnceWith(
            updatedResolveFixture,
          );
        });

        it('should update resolve', () => {
          expect(dynamicValueBindingNode.resolve).toBe(updatedResolveFixture);
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  });
});
