import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { type PlanBindingNode } from '../../planning/models/PlanBindingNode.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type PlanServiceRedirectionBindingNode } from '../../planning/models/PlanServiceRedirectionBindingNode.js';
import { type ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode.js';
import { type PlanBindingInspection } from '../models/PlanBindingInspection.js';
import { type PlanServiceInspection } from '../models/PlanServiceInspection.js';
import { buildInstanceBindingInspection } from './buildInstanceBindingInspection.js';
import { buildResolvedValueBindingInspection } from './buildResolvedValueBindingInspection.js';
import { buildScopedBindingInspection } from './buildScopedBindingInspection.js';
import { buildServiceRedirectionBindingInspection } from './buildServiceRedirectionBindingInspection.js';

export function curryBuildPlanBindingInspection(
  buildPlanServiceInspection: (
    serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
    serviceNode: PlanServiceNode,
    options: BuildServiceNodeOptions,
  ) => PlanServiceInspection,
): (
  serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
  bindingNode: PlanBindingNode,
  options: BuildServiceNodeOptions,
) => PlanBindingInspection {
  return (
    serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
    bindingNode: PlanBindingNode,
    options: BuildServiceNodeOptions,
  ): PlanBindingInspection => {
    const binding: PlanBindingNode['binding'] = bindingNode.binding;

    switch (binding.type) {
      case bindingTypeValues.ConstantValue:
        return buildScopedBindingInspection(binding);
      case bindingTypeValues.DynamicValue:
        return buildScopedBindingInspection(binding);
      case bindingTypeValues.Factory:
        return buildScopedBindingInspection(binding);
      case bindingTypeValues.Instance:
        return buildInstanceBindingInspection(
          buildPlanServiceInspection,
          serviceInspections,
          bindingNode as InstanceBindingNode,
        );
      case bindingTypeValues.ResolvedValue:
        return buildResolvedValueBindingInspection(
          buildPlanServiceInspection,
          serviceInspections,
          bindingNode as ResolvedValueBindingNode,
        );
      case bindingTypeValues.ServiceRedirection:
        return buildServiceRedirectionBindingInspection(
          buildPlanServiceInspection,
          serviceInspections,
          bindingNode as PlanServiceRedirectionBindingNode,
          options,
        );
    }
  };
}
