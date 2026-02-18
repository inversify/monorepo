import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('../calculations/buildGetPlanOptionsFromPlanParams.js'));
vitest.mock(import('./curryBuildPlanServiceNode.js'), () => {
  const buildPlanServiceNode: Mock<(params: PlanParams) => PlanServiceNode> =
    vitest.fn();

  return {
    curryBuildPlanServiceNode: vitest
      .fn()
      .mockReturnValue(buildPlanServiceNode),
  };
});

import { type Binding } from '../../binding/models/Binding.js';
import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import { type SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { buildGetPlanOptionsFromPlanParams } from '../calculations/buildGetPlanOptionsFromPlanParams.js';
import { type BasePlanParams } from '../models/BasePlanParams.js';
import { type BindingNodeParent } from '../models/BindingNodeParent.js';
import { type GetPlanOptions } from '../models/GetPlanOptions.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanParams } from '../models/PlanParams.js';
import { type PlanParamsConstraint } from '../models/PlanParamsConstraint.js';
import { type PlanParamsOperations } from '../models/PlanParamsOperations.js';
import { type PlanResult } from '../models/PlanResult.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { curryBuildPlanServiceNode } from './curryBuildPlanServiceNode.js';
import { plan } from './plan.js';

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
