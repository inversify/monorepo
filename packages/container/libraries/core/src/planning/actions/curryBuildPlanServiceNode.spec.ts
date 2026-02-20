import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock(import('../calculations/buildFilteredServiceBindings.js'));
vitest.mock(import('../calculations/buildPlanBindingConstraintsList.js'));
vitest.mock(
  import('../calculations/checkServiceNodeSingleInjectionBindings.js'),
);

import { type Binding } from '../../binding/models/Binding.js';
import {
  BindingConstraintsImplementation,
  type InternalBindingConstraints,
} from '../../binding/models/BindingConstraintsImplementation.js';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { buildFilteredServiceBindings } from '../calculations/buildFilteredServiceBindings.js';
import { buildPlanBindingConstraintsList } from '../calculations/buildPlanBindingConstraintsList.js';
import { checkServiceNodeSingleInjectionBindings } from '../calculations/checkServiceNodeSingleInjectionBindings.js';
import { type BasePlanParams } from '../models/BasePlanParams.js';
import { type BindingNodeParent } from '../models/BindingNodeParent.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanParams } from '../models/PlanParams.js';
import { type PlanParamsOperations } from '../models/PlanParamsOperations.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { curryBuildPlanServiceNode } from './curryBuildPlanServiceNode.js';

describe(curryBuildPlanServiceNode, () => {
  let buildServiceNodeBindingsMock: Mock<
    (
      params: BasePlanParams,
      bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
      serviceBindings: Binding<unknown>[],
      parentNode: BindingNodeParent,
      chainedBindings: boolean,
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
        planBindingNodesFixture = [Symbol() as unknown as PlanBindingNode];

        vitest
          .mocked(buildPlanBindingConstraintsList)
          .mockReturnValueOnce(bindingConstraintsListFixture);

        vitest
          .mocked(buildFilteredServiceBindings)
          .mockReturnValueOnce(bindingsFixture);

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

      it('should call buildServiceNodeBindings()', () => {
        const expectedServiceNode: BindingNodeParent = {
          bindings: planBindingNodesFixture,
          isContextFree: true,
          serviceIdentifier:
            planParamsFixture.rootConstraints.serviceIdentifier,
        };

        expect(buildServiceNodeBindingsMock).toHaveBeenCalledExactlyOnceWith(
          planParamsFixture,
          bindingConstraintsListFixture,
          bindingsFixture,
          expectedServiceNode,
          false,
        );
      });

      it('should return expected value', () => {
        const expectedServiceNode: PlanServiceNode = {
          bindings: planBindingNodesFixture,
          isContextFree: true,
          serviceIdentifier:
            planParamsFixture.rootConstraints.serviceIdentifier,
        };

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
        planBindingNodeFixture = Symbol() as unknown as PlanBindingNode;

        vitest
          .mocked(buildPlanBindingConstraintsList)
          .mockReturnValueOnce(bindingConstraintsListFixture);

        vitest
          .mocked(buildFilteredServiceBindings)
          .mockReturnValueOnce(bindingsFixture);

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

      it('should call buildServiceNodeBindings()', () => {
        const expectedServiceNode: BindingNodeParent = {
          bindings: planBindingNodeFixture,
          isContextFree: true,
          serviceIdentifier:
            planParamsFixture.rootConstraints.serviceIdentifier,
        };

        expect(buildServiceNodeBindingsMock).toHaveBeenCalledExactlyOnceWith(
          planParamsFixture,
          bindingConstraintsListFixture,
          bindingsFixture,
          expectedServiceNode,
          false,
        );
      });

      it('should call checkServiceNodeSingleInjectionBindings()', () => {
        const expectedServiceNode: BindingNodeParent = {
          bindings: planBindingNodeFixture,
          isContextFree: true,
          serviceIdentifier:
            planParamsFixture.rootConstraints.serviceIdentifier,
        };

        expect(
          checkServiceNodeSingleInjectionBindings,
        ).toHaveBeenCalledExactlyOnceWith(
          expectedServiceNode,
          false,
          bindingConstraintsListFixture.last,
        );
      });

      it('should return expected value', () => {
        const expectedServiceNode: PlanServiceNode = {
          bindings: planBindingNodeFixture,
          isContextFree: true,
          serviceIdentifier:
            planParamsFixture.rootConstraints.serviceIdentifier,
        };

        expect(result).toStrictEqual(expectedServiceNode);
      });
    });
  });
});
