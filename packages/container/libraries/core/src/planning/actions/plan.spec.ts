import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('../calculations/buildGetPlanOptionsFromPlanParams');
vitest.mock('./curryBuildPlanServiceNode', () => {
  const buildPlanServiceNode: Mock<(params: PlanParams) => PlanServiceNode> =
    vitest.fn();

  return {
    curryBuildPlanServiceNode: vitest
      .fn()
      .mockReturnValue(buildPlanServiceNode),
  };
});

import { Binding } from '../../binding/models/Binding';
import { InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList';
import { buildGetPlanOptionsFromPlanParams } from '../calculations/buildGetPlanOptionsFromPlanParams';
import { BasePlanParams } from '../models/BasePlanParams';
import { BindingNodeParent } from '../models/BindingNodeParent';
import { GetPlanOptions } from '../models/GetPlanOptions';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanParams } from '../models/PlanParams';
import { PlanParamsConstraint } from '../models/PlanParamsConstraint';
import { PlanParamsOperations } from '../models/PlanParamsOperations';
import { PlanResult } from '../models/PlanResult';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { curryBuildPlanServiceNode } from './curryBuildPlanServiceNode';
import { plan } from './plan';

describe(plan, () => {
  let paramsFixture: Mocked<PlanParams>;
  let buildPlanServiceNodeMock: Mock<(params: PlanParams) => PlanServiceNode>;

  beforeAll(() => {
    buildPlanServiceNodeMock = vitest.mocked(
      curryBuildPlanServiceNode(
        Symbol() as unknown as (
          params: BasePlanParams,
          bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
          serviceBindings: Binding<unknown>[],
          parentNode: BindingNodeParent,
          chainedBindings: boolean,
        ) => PlanBindingNode[],
      ),
    );

    paramsFixture = {
      autobindOptions: undefined,
      operations: {
        getPlan: vitest.fn(),
        setPlan: vitest.fn(),
      } as Partial<
        Mocked<PlanParamsOperations>
      > as Mocked<PlanParamsOperations>,
      rootConstraints: Symbol() as unknown as PlanParamsConstraint,
      servicesBranch: [],
    };
  });

  describe('when called, and params.operations.getPlan() returns PlanResult', () => {
    let getPlanOptionsFixture: GetPlanOptions;
    let planResultFixture: PlanResult;
    let result: unknown;

    beforeAll(() => {
      getPlanOptionsFixture = Symbol() as unknown as GetPlanOptions;
      planResultFixture = Symbol() as unknown as PlanResult;

      vitest
        .mocked(buildGetPlanOptionsFromPlanParams)
        .mockReturnValueOnce(getPlanOptionsFixture);

      vitest
        .mocked(paramsFixture.operations.getPlan)
        .mockReturnValueOnce(planResultFixture);

      result = plan(paramsFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call buildGetPlanOptionsFromPlanParams()', () => {
      expect(buildGetPlanOptionsFromPlanParams).toHaveBeenCalledExactlyOnceWith(
        paramsFixture,
      );
    });

    it('should call params.operations.getPlan()', () => {
      expect(paramsFixture.operations.getPlan).toHaveBeenCalledExactlyOnceWith(
        getPlanOptionsFixture,
      );
    });

    it('should return expected value', () => {
      expect(result).toBe(planResultFixture);
    });
  });

  describe('when called, and params.operations.getPlan() returns undefined', () => {
    let getPlanOptionsFixture: GetPlanOptions;
    let planServiceNodeFixture: PlanServiceNode;
    let result: unknown;

    beforeAll(() => {
      getPlanOptionsFixture = Symbol() as unknown as GetPlanOptions;
      planServiceNodeFixture = {
        bindings: Symbol() as unknown as PlanBindingNode,
        isContextFree: true,
        serviceIdentifier: Symbol(),
      };

      vitest
        .mocked(buildGetPlanOptionsFromPlanParams)
        .mockReturnValueOnce(getPlanOptionsFixture);

      vitest
        .mocked(paramsFixture.operations.getPlan)
        .mockReturnValueOnce(undefined);

      buildPlanServiceNodeMock.mockReturnValueOnce(planServiceNodeFixture);

      result = plan(paramsFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call buildGetPlanOptionsFromPlanParams()', () => {
      expect(buildGetPlanOptionsFromPlanParams).toHaveBeenCalledExactlyOnceWith(
        paramsFixture,
      );
    });

    it('should call params.operations.getPlan()', () => {
      expect(paramsFixture.operations.getPlan).toHaveBeenCalledExactlyOnceWith(
        getPlanOptionsFixture,
      );
    });

    it('should call buildPlanServiceNode()', () => {
      expect(buildPlanServiceNodeMock).toHaveBeenCalledExactlyOnceWith(
        paramsFixture,
      );
    });

    it('should return expected value', () => {
      const expectedPlanResult: PlanResult = {
        tree: {
          root: expect.objectContaining(planServiceNodeFixture),
        },
      };

      expect(result).toStrictEqual(expectedPlanResult);
    });
  });
});
