import { buildBuildServiceNodeOptionsFromResolvedValueElementMetadata } from '../../common/calculations/buildBuildServiceNodeOptionsFromResolvedValueElementMetadata.js';
import { type ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata.js';
import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode.js';
import { type PlanServiceInspection } from '../models/PlanServiceInspection.js';
import { type ResolvedValueBindingInspection } from '../models/ResolvedValueBindingInspection.js';
import { buildScopedBindingInspection } from './buildScopedBindingInspection.js';

export function buildResolvedValueBindingInspection(
  buildPlanServiceInspection: (
    serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
    serviceNode: PlanServiceNode,
    options: BuildServiceNodeOptions,
  ) => PlanServiceInspection,
  serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
  node: ResolvedValueBindingNode,
): ResolvedValueBindingInspection {
  const argumentsMetadata: ResolvedValueElementMetadata[] =
    node.binding.metadata.arguments;

  return {
    ...buildScopedBindingInspection(node.binding),
    arguments: node.params.map(
      (param: PlanServiceNode, index: number): PlanServiceInspection =>
        buildPlanServiceInspection(
          serviceInspections,
          param,
          buildBuildServiceNodeOptionsFromResolvedValueElementMetadata(
            argumentsMetadata[index] as ResolvedValueElementMetadata,
          ),
        ),
    ),
  };
}
