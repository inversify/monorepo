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
  import('../../common/calculations/buildBuildServiceNodeOptionsFromPlanParamsConstraints.js'),
);
vitest.mock(import('../calculations/buildFilteredServiceBindings.js'));
vitest.mock(import('../calculations/buildPlanBindingConstraintsList.js'));
vitest.mock(
  import('../calculations/throwErrorWhenUnexpectedBindingsAmountFound.js'),
);

import { type Binding } from '../../binding/models/Binding.js';
import {
  BindingConstraintsImplementation,
  type InternalBindingConstraints,
} from '../../binding/models/BindingConstraintsImplementation.js';
import { buildBuildServiceNodeOptionsFromPlanParamsConstraints } from '../../common/calculations/buildBuildServiceNodeOptionsFromPlanParamsConstraints.js';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { buildFilteredServiceBindings } from '../calculations/buildFilteredServiceBindings.js';
import { buildPlanBindingConstraintsList } from '../calculations/buildPlanBindingConstraintsList.js';
import { throwErrorWhenUnexpectedBindingsAmountFound } from '../calculations/throwErrorWhenUnexpectedBindingsAmountFound.js';
import { type BasePlanParams } from '../models/BasePlanParams.js';
import { type BindingNodeParent } from '../models/BindingNodeParent.js';
import { type BuildServiceNodeOptions } from '../models/BuildServiceNodeOptions.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { PlanMultipleBindingServiceNodeImplementation } from '../models/PlanMultipleBindingServiceNodeImplementation.js';
import { type PlanParams } from '../models/PlanParams.js';
import { type PlanParamsOperations } from '../models/PlanParamsOperations.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { PlanSingleBindingServiceNodeImplementation } from '../models/PlanSingleBindingServiceNode.js';
import { curryBuildPlanServiceNode } from './curryBuildPlanServiceNode.js';

describe(curryBuildPlanServiceNode, () => {
  let buildServiceNodeBindingsMock: Mock<
    (
      params: BasePlanParams,
      bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
      serviceBindings: Binding<unknown>[],
      parentNode: BindingNodeParent,
      options: BuildServiceNodeOptions,
    ) => PlanBindingNode[]
  >;

  beforeAll(() => {
    buildServiceNodeBindingsMock = vitest.fn();
  });

  describe('having PlanParams with rootConstraints.isMultiple true and chained false', () => {
    let planParamsFixture: PlanParams;

    beforeAll(() => {
      planParamsFixture = {
        autobindOptions: undefined,
        operations: {} as Partial<PlanParamsOperations> as PlanParamsOperations,
        rootConstraints: {
          chained: false,
          isMultiple: true,
          serviceIdentifier: Symbol(),
        },
        servicesBranch: [],
      };
    });

    describe('when called', () => {
      let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
      let bindingsFixture: Binding<unknown>[];
      let buildServiceNodeOptionsFixture: BuildServiceNodeOptions;
      let planBindingNodesFixture: PlanBindingNode[];

      let result: unknown;

      beforeAll(() => {
        bindingConstraintsListFixture =
          new SingleImmutableLinkedList<InternalBindingConstraints>(
            {
              elem: Symbol() as unknown as InternalBindingConstraints,
              previous: undefined,
            },
            1,
          );

        bindingsFixture = [Symbol() as unknown as Binding<unknown>];
        buildServiceNodeOptionsFixture =
          Symbol() as unknown as BuildServiceNodeOptions;
        planBindingNodesFixture = [Symbol() as unknown as PlanBindingNode];

        vitest
          .mocked(buildPlanBindingConstraintsList)
          .mockReturnValueOnce(bindingConstraintsListFixture);

        vitest
          .mocked(buildFilteredServiceBindings)
          .mockReturnValueOnce(bindingsFixture);

        vitest
          .mocked(buildBuildServiceNodeOptionsFromPlanParamsConstraints)
          .mockReturnValueOnce(buildServiceNodeOptionsFixture);

        buildServiceNodeBindingsMock.mockReturnValueOnce(
          planBindingNodesFixture,
        );

        result = curryBuildPlanServiceNode(buildServiceNodeBindingsMock)(
          planParamsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildPlanBindingConstraintsList()', () => {
        expect(buildPlanBindingConstraintsList).toHaveBeenCalledExactlyOnceWith(
          planParamsFixture,
        );
      });

      it('should call buildFilteredServiceBindings()', () => {
        expect(buildFilteredServiceBindings).toHaveBeenCalledExactlyOnceWith(
          planParamsFixture,
          new BindingConstraintsImplementation(
            bindingConstraintsListFixture.last,
          ),
          { chained: false },
        );
      });

      it('should call buildBuildServiceNodeOptionsFromPlanParamsConstraints()', () => {
        expect(
          buildBuildServiceNodeOptionsFromPlanParamsConstraints,
        ).toHaveBeenCalledExactlyOnceWith(planParamsFixture.rootConstraints);
      });

      it('should call buildServiceNodeBindings()', () => {
        expect(buildServiceNodeBindingsMock).toHaveBeenCalledExactlyOnceWith(
          planParamsFixture,
          bindingConstraintsListFixture,
          bindingsFixture,
          result as BindingNodeParent,
          buildServiceNodeOptionsFixture,
        );
      });

      it('should not call throwErrorWhenUnexpectedBindingsAmountFound()', () => {
        expect(
          throwErrorWhenUnexpectedBindingsAmountFound,
        ).not.toHaveBeenCalled();
      });

      it('should return expected value', () => {
        const expectedServiceNode: PlanServiceNode =
          new PlanMultipleBindingServiceNodeImplementation(
            planBindingNodesFixture,
            planParamsFixture.rootConstraints.serviceIdentifier,
          );

        expect(result).toStrictEqual(expectedServiceNode);
      });
    });
  });

  describe('having PlanParams with rootConstraints.isMultiple false', () => {
    let planParamsFixture: PlanParams;

    beforeAll(() => {
      planParamsFixture = {
        autobindOptions: undefined,
        operations: {} as Partial<PlanParamsOperations> as PlanParamsOperations,
        rootConstraints: {
          isMultiple: false,
          serviceIdentifier: Symbol(),
        },
        servicesBranch: [],
      };
    });

    describe('when called', () => {
      let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
      let bindingsFixture: Binding<unknown>[];
      let buildServiceNodeOptionsFixture: BuildServiceNodeOptions;
      let planBindingNodeFixture: PlanBindingNode;

      let result: unknown;

      beforeAll(() => {
        bindingConstraintsListFixture =
          new SingleImmutableLinkedList<InternalBindingConstraints>(
            {
              elem: Symbol() as unknown as InternalBindingConstraints,
              previous: undefined,
            },
            1,
          );

        bindingsFixture = [Symbol() as unknown as Binding<unknown>];
        buildServiceNodeOptionsFixture =
          Symbol() as unknown as BuildServiceNodeOptions;
        planBindingNodeFixture = {
          resolve: vitest.fn(),
        } as Partial<PlanBindingNode> as PlanBindingNode;

        vitest
          .mocked(buildPlanBindingConstraintsList)
          .mockReturnValueOnce(bindingConstraintsListFixture);

        vitest
          .mocked(buildFilteredServiceBindings)
          .mockReturnValueOnce(bindingsFixture);

        vitest
          .mocked(buildBuildServiceNodeOptionsFromPlanParamsConstraints)
          .mockReturnValueOnce(buildServiceNodeOptionsFixture);

        buildServiceNodeBindingsMock.mockReturnValueOnce([
          planBindingNodeFixture,
        ]);

        result = curryBuildPlanServiceNode(buildServiceNodeBindingsMock)(
          planParamsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildPlanBindingConstraintsList()', () => {
        expect(buildPlanBindingConstraintsList).toHaveBeenCalledExactlyOnceWith(
          planParamsFixture,
        );
      });

      it('should call buildFilteredServiceBindings()', () => {
        expect(buildFilteredServiceBindings).toHaveBeenCalledExactlyOnceWith(
          planParamsFixture,
          new BindingConstraintsImplementation(
            bindingConstraintsListFixture.last,
          ),
          { chained: false },
        );
      });

      it('should call buildBuildServiceNodeOptionsFromPlanParamsConstraints()', () => {
        expect(
          buildBuildServiceNodeOptionsFromPlanParamsConstraints,
        ).toHaveBeenCalledExactlyOnceWith(planParamsFixture.rootConstraints);
      });

      it('should call buildServiceNodeBindings()', () => {
        expect(buildServiceNodeBindingsMock).toHaveBeenCalledExactlyOnceWith(
          planParamsFixture,
          bindingConstraintsListFixture,
          bindingsFixture,
          result as BindingNodeParent,
          buildServiceNodeOptionsFixture,
        );
      });

      it('should call throwErrorWhenUnexpectedBindingsAmountFound()', () => {
        expect(
          throwErrorWhenUnexpectedBindingsAmountFound,
        ).toHaveBeenCalledExactlyOnceWith(
          [planBindingNodeFixture],
          false,
          bindingConstraintsListFixture.last,
        );
      });

      it('should return expected value', () => {
        expect(result).toBeInstanceOf(
          PlanSingleBindingServiceNodeImplementation,
        );

        const resultServiceNode: PlanServiceNode = result as PlanServiceNode;

        expect(resultServiceNode.bindings).toBe(planBindingNodeFixture);
        expect(resultServiceNode.isContextFree).toBe(true);
        expect(resultServiceNode.serviceIdentifier).toBe(
          planParamsFixture.rootConstraints.serviceIdentifier,
        );
      });
    });
  });
});
