import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type PlanServiceRedirectionBindingNode } from '../../planning/models/PlanServiceRedirectionBindingNode.js';
import { type PlanServiceInspection } from '../models/PlanServiceInspection.js';
import { type ServiceRedirectionBindingInspection } from '../models/ServiceRedirectionBindingInspection.js';

export function buildServiceRedirectionBindingInspection(
  buildPlanServiceInspection: (
    serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
    serviceNode: PlanServiceNode,
    options: BuildServiceNodeOptions,
  ) => PlanServiceInspection,
  serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
  node: PlanServiceRedirectionBindingNode,
  options: BuildServiceNodeOptions,
): ServiceRedirectionBindingInspection {
  return {
    id: node.binding.id,
    moduleId: node.binding.moduleId,
    redirection: buildPlanServiceInspection(
      serviceInspections,
      node.redirection,
      {
        ...options,
        serviceIdentifier: node.binding.targetServiceIdentifier,
      },
    ),
    serviceIdentifier: node.binding.serviceIdentifier,
    targetServiceIdentifier: node.binding.targetServiceIdentifier,
    type: node.binding.type,
  };
}
