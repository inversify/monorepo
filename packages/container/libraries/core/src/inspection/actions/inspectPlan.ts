import { buildBuildServiceNodeOptionsFromGetPlanOptions } from '../../common/calculations/buildBuildServiceNodeOptionsFromGetPlanOptions.js';
import { handleResolveError } from '../../planning/calculations/handleResolveError.js';
import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';
import { type GetPlanOptions } from '../../planning/models/GetPlanOptions.js';
import { type PlanBindingNode } from '../../planning/models/PlanBindingNode.js';
import { type PlanResult } from '../../planning/models/PlanResult.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { curryBuildPlanBindingInspection } from '../calculations/curryBuildPlanBindingInspection.js';
import { curryBuildPlanServiceInspection } from '../calculations/curryBuildPlanServiceInspection.js';
import { type PlanBindingInspection } from '../models/PlanBindingInspection.js';
import { type PlanInspection } from '../models/PlanInspection.js';
import { type PlanServiceInspection } from '../models/PlanServiceInspection.js';

const buildPlanBindingInspection: (
  serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
  bindingNode: PlanBindingNode,
  options: BuildServiceNodeOptions,
) => PlanBindingInspection = curryBuildPlanBindingInspection(
  circularBuildPlanServiceInspection,
);

const buildPlanServiceInspection: (
  serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
  serviceNode: PlanServiceNode,
  options: BuildServiceNodeOptions,
) => PlanServiceInspection = curryBuildPlanServiceInspection(
  buildPlanBindingInspection,
);

function circularBuildPlanServiceInspection(
  serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
  serviceNode: PlanServiceNode,
  options: BuildServiceNodeOptions,
): PlanServiceInspection {
  return buildPlanServiceInspection(serviceInspections, serviceNode, options);
}

export function inspectPlan(
  options: GetPlanOptions,
  planResult: PlanResult,
): PlanInspection {
  try {
    return {
      root: buildPlanServiceInspection(
        new Map(),
        planResult.tree.root,
        buildBuildServiceNodeOptionsFromGetPlanOptions(options),
      ),
    };
  } catch (error: unknown) {
    handleResolveError(planResult, error);
  }
}
