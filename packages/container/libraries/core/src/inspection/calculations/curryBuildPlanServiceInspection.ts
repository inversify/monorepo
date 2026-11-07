import { type Writable } from '../../common/models/Writable.js';
import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';
import { type PlanBindingNode } from '../../planning/models/PlanBindingNode.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type MultipleBindingPlanServiceInspection } from '../models/MultipleBindingPlanServiceInspection.js';
import { type PlanBindingInspection } from '../models/PlanBindingInspection.js';
import { type PlanServiceInspection } from '../models/PlanServiceInspection.js';
import { type SingleBindingPlanServiceInspection } from '../models/SingleBindingPlanServiceInspection.js';

export function curryBuildPlanServiceInspection(
  buildPlanBindingInspection: (
    serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
    bindingNode: PlanBindingNode,
    options: BuildServiceNodeOptions,
  ) => PlanBindingInspection,
): (
  serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
  serviceNode: PlanServiceNode,
  options: BuildServiceNodeOptions,
) => PlanServiceInspection {
  return (
    serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
    serviceNode: PlanServiceNode,
    options: BuildServiceNodeOptions,
  ): PlanServiceInspection => {
    const existingServiceInspection: PlanServiceInspection | undefined =
      serviceInspections.get(serviceNode);

    if (existingServiceInspection !== undefined) {
      return existingServiceInspection;
    }

    // Registered before walking bindings so shared nodes and cycles resolve to this object
    if (options.isMultiple) {
      const bindings: PlanBindingInspection[] = [];

      const serviceInspection: MultipleBindingPlanServiceInspection = {
        bindings,
        chained: options.chained,
        isMultiple: true,
        name: options.name,
        optional: options.optional,
        serviceIdentifier: serviceNode.serviceIdentifier,
        tags: new Map(options.tags),
      };

      serviceInspections.set(serviceNode, serviceInspection);

      for (const bindingNode of getBindingNodes(serviceNode)) {
        bindings.push(
          buildPlanBindingInspection(serviceInspections, bindingNode, options),
        );
      }

      return serviceInspection;
    }

    const serviceInspection: Writable<SingleBindingPlanServiceInspection> = {
      binding: undefined,
      isMultiple: false,
      name: options.name,
      optional: options.optional,
      serviceIdentifier: serviceNode.serviceIdentifier,
      tags: new Map(options.tags),
    };

    serviceInspections.set(serviceNode, serviceInspection);

    const [bindingNode]: PlanBindingNode[] = getBindingNodes(serviceNode);

    if (bindingNode !== undefined) {
      serviceInspection.binding = buildPlanBindingInspection(
        serviceInspections,
        bindingNode,
        options,
      );
    }

    return serviceInspection;
  };
}

function getBindingNodes(serviceNode: PlanServiceNode): PlanBindingNode[] {
  const bindings: PlanBindingNode | PlanBindingNode[] | undefined =
    serviceNode.bindings;

  if (bindings === undefined) {
    return [];
  }

  return Array.isArray(bindings) ? bindings : [bindings];
}
