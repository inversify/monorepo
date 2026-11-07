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
  import('../../common/calculations/buildBuildServiceNodeOptionsFromGetPlanOptions.js'),
);
vitest.mock(import('../../planning/calculations/handleResolveError.js'));
vitest.mock(import('../calculations/curryBuildPlanBindingInspection.js'));
vitest.mock(
  import('../calculations/curryBuildPlanServiceInspection.js'),
  () => {
    const buildPlanServiceInspection: Mock<
      (
        serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
        serviceNode: PlanServiceNode,
        options: BuildServiceNodeOptions,
      ) => PlanServiceInspection
    > = vitest.fn();

    return {
      curryBuildPlanServiceInspection: vitest
        .fn()
        .mockReturnValue(buildPlanServiceInspection),
    };
  },
);

import { buildBuildServiceNodeOptionsFromGetPlanOptions } from '../../common/calculations/buildBuildServiceNodeOptionsFromGetPlanOptions.js';
import { handleResolveError } from '../../planning/calculations/handleResolveError.js';
import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';
import { type GetPlanOptions } from '../../planning/models/GetPlanOptions.js';
import { type PlanBindingNode } from '../../planning/models/PlanBindingNode.js';
import { type PlanResult } from '../../planning/models/PlanResult.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { curryBuildPlanServiceInspection } from '../calculations/curryBuildPlanServiceInspection.js';
import { type PlanBindingInspection } from '../models/PlanBindingInspection.js';
import { type PlanInspection } from '../models/PlanInspection.js';
import { type PlanServiceInspection } from '../models/PlanServiceInspection.js';
import { inspectPlan } from './inspectPlan.js';

describe(inspectPlan, () => {
  let buildPlanServiceInspectionMock: Mock<
    (
      serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
      serviceNode: PlanServiceNode,
      options: BuildServiceNodeOptions,
    ) => PlanServiceInspection
  >;

  let getPlanOptionsFixture: GetPlanOptions;
  let planResultFixture: PlanResult;

  beforeAll(() => {
    buildPlanServiceInspectionMock = vitest.mocked(
      curryBuildPlanServiceInspection(
        Symbol() as unknown as (
          serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
          bindingNode: PlanBindingNode,
          options: BuildServiceNodeOptions,
        ) => PlanBindingInspection,
      ),
    );

    getPlanOptionsFixture = Symbol() as unknown as GetPlanOptions;
    planResultFixture = {
      tree: {
        root: Symbol() as unknown as PlanServiceNode,
      },
    };
  });

  describe('when called', () => {
    let buildServiceNodeOptionsFixture: BuildServiceNodeOptions;
    let serviceInspectionFixture: PlanServiceInspection;

    let result: unknown;

    beforeAll(() => {
      buildServiceNodeOptionsFixture =
        Symbol() as unknown as BuildServiceNodeOptions;
      serviceInspectionFixture = Symbol() as unknown as PlanServiceInspection;

      vitest
        .mocked(buildBuildServiceNodeOptionsFromGetPlanOptions)
        .mockReturnValueOnce(buildServiceNodeOptionsFixture);

      buildPlanServiceInspectionMock.mockReturnValueOnce(
        serviceInspectionFixture,
      );

      result = inspectPlan(getPlanOptionsFixture, planResultFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call buildBuildServiceNodeOptionsFromGetPlanOptions()', () => {
      expect(
        buildBuildServiceNodeOptionsFromGetPlanOptions,
      ).toHaveBeenCalledExactlyOnceWith(getPlanOptionsFixture);
    });

    it('should call buildPlanServiceInspection()', () => {
      expect(buildPlanServiceInspectionMock).toHaveBeenCalledExactlyOnceWith(
        new Map(),
        planResultFixture.tree.root,
        buildServiceNodeOptionsFixture,
      );
    });

    it('should return a PlanInspection', () => {
      const expected: PlanInspection = {
        root: serviceInspectionFixture,
      };

      expect(result).toStrictEqual(expected);
    });
  });

  describe('when called, and buildPlanServiceInspection() throws an error', () => {
    let errorFixture: Error;
    let handledErrorFixture: Error;

    let result: unknown;

    beforeAll(() => {
      errorFixture = new Error('planning error');
      handledErrorFixture = new Error('handled error');

      buildPlanServiceInspectionMock.mockImplementationOnce((): never => {
        throw errorFixture;
      });

      vitest.mocked(handleResolveError).mockImplementationOnce((): never => {
        throw handledErrorFixture;
      });

      try {
        inspectPlan(getPlanOptionsFixture, planResultFixture);
      } catch (error: unknown) {
        result = error;
      }
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call handleResolveError()', () => {
      expect(handleResolveError).toHaveBeenCalledExactlyOnceWith(
        planResultFixture,
        errorFixture,
      );
    });

    it('should throw the handled error', () => {
      expect(result).toBe(handledErrorFixture);
    });
  });
});
