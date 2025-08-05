import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

vitest.mock('../calculations/buildFilteredServiceBindings');
vitest.mock('../calculations/buildPlanBindingConstraintsList');
vitest.mock('../calculations/checkServiceNodeSingleInjectionBindings');

import { Binding } from '../../binding/models/Binding';
import {
  BindingConstraintsImplementation,
  InternalBindingConstraints,
} from '../../binding/models/BindingConstraintsImplementation';
import { SingleInmutableLinkedList } from '../../common/models/SingleInmutableLinkedList';
import { buildFilteredServiceBindings } from '../calculations/buildFilteredServiceBindings';
import { buildPlanBindingConstraintsList } from '../calculations/buildPlanBindingConstraintsList';
import { checkServiceNodeSingleInjectionBindings } from '../calculations/checkServiceNodeSingleInjectionBindings';
import { BasePlanParams } from '../models/BasePlanParams';
import { BindingNodeParent } from '../models/BindingNodeParent';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanParams } from '../models/PlanParams';
import { PlanParamsOperations } from '../models/PlanParamsOperations';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { curryBuildPlanServiceNode } from './curryBuildPlanServiceNode';

describe(curryBuildPlanServiceNode, () => {
  let buildServiceNodeBindingsMock: Mock<
    (
      params: BasePlanParams,
      bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
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
      let bindingConstraintsListFixture: SingleInmutableLinkedList<InternalBindingConstraints>;
      let bindingsFixture: Binding<unknown>[];
      let planBindingNodesFixture: PlanBindingNode[];

      let result: unknown;

      beforeAll(() => {
        bindingConstraintsListFixture =
          new SingleInmutableLinkedList<InternalBindingConstraints>({
            elem: Symbol() as unknown as InternalBindingConstraints,
            previous: undefined,
          });

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
        expect(buildPlanBindingConstraintsList).toHaveBeenCalledTimes(1);
        expect(buildPlanBindingConstraintsList).toHaveBeenCalledWith(
          planParamsFixture,
        );
      });

      it('should call buildFilteredServiceBindings()', () => {
        expect(buildFilteredServiceBindings).toHaveBeenCalledTimes(1);
        expect(buildFilteredServiceBindings).toHaveBeenCalledWith(
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

        expect(buildServiceNodeBindingsMock).toHaveBeenCalledTimes(1);
        expect(buildServiceNodeBindingsMock).toHaveBeenCalledWith(
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
      let bindingConstraintsListFixture: SingleInmutableLinkedList<InternalBindingConstraints>;
      let bindingsFixture: Binding<unknown>[];
      let planBindingNodeFixture: PlanBindingNode;

      let result: unknown;

      beforeAll(() => {
        bindingConstraintsListFixture =
          new SingleInmutableLinkedList<InternalBindingConstraints>({
            elem: Symbol() as unknown as InternalBindingConstraints,
            previous: undefined,
          });

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
        expect(buildPlanBindingConstraintsList).toHaveBeenCalledTimes(1);
        expect(buildPlanBindingConstraintsList).toHaveBeenCalledWith(
          planParamsFixture,
        );
      });

      it('should call buildFilteredServiceBindings()', () => {
        expect(buildFilteredServiceBindings).toHaveBeenCalledTimes(1);
        expect(buildFilteredServiceBindings).toHaveBeenCalledWith(
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

        expect(buildServiceNodeBindingsMock).toHaveBeenCalledTimes(1);
        expect(buildServiceNodeBindingsMock).toHaveBeenCalledWith(
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

        expect(checkServiceNodeSingleInjectionBindings).toHaveBeenCalledTimes(
          1,
        );
        expect(checkServiceNodeSingleInjectionBindings).toHaveBeenCalledWith(
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
