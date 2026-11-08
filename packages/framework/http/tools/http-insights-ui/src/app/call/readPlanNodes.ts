import {
  type ConstantValuePlanBinding,
  type DynamicValuePlanBinding,
  type FactoryPlanBinding,
  type InstancePlanBinding,
  type Plan,
  type PlanBinding,
  type PlanProperty,
  type PlanService,
  type ResolvedValuePlanBinding,
  type ServiceRedirectionPlanBinding,
} from './planDetail.js';

export interface PlanServiceNode {
  readonly bindings: readonly PlanBindingNode[];
  readonly reference: boolean;
  readonly service: PlanService;
}

export interface PlanPropertyNode {
  readonly key: PlanProperty['key'];
  readonly service: PlanServiceNode;
}

interface ConstantValuePlanBindingNode {
  readonly binding: ConstantValuePlanBinding;
  readonly type: 'ConstantValue';
}

interface DynamicValuePlanBindingNode {
  readonly binding: DynamicValuePlanBinding;
  readonly type: 'DynamicValue';
}

interface FactoryPlanBindingNode {
  readonly binding: FactoryPlanBinding;
  readonly type: 'Factory';
}

interface InstancePlanBindingNode {
  readonly binding: InstancePlanBinding;
  readonly constructorArguments: readonly (PlanServiceNode | null)[];
  readonly properties: readonly PlanPropertyNode[];
  readonly type: 'Instance';
}

interface ResolvedValuePlanBindingNode {
  readonly arguments: readonly PlanServiceNode[];
  readonly binding: ResolvedValuePlanBinding;
  readonly type: 'ResolvedValue';
}

interface ServiceRedirectionPlanBindingNode {
  readonly binding: ServiceRedirectionPlanBinding;
  readonly redirection: PlanServiceNode;
  readonly type: 'ServiceRedirection';
}

export type PlanBindingNode =
  | ConstantValuePlanBindingNode
  | DynamicValuePlanBindingNode
  | FactoryPlanBindingNode
  | InstancePlanBindingNode
  | ResolvedValuePlanBindingNode
  | ServiceRedirectionPlanBindingNode;

export function readPlanNodes(plan: Plan): PlanServiceNode {
  return readServiceNode(plan.root, new Set());
}

function readServiceNode(
  service: PlanService,
  seen: Set<string>,
): PlanServiceNode {
  if (seen.has(service.id)) {
    return {
      bindings: [],
      reference: true,
      service,
    };
  }

  seen.add(service.id);

  return {
    bindings: service.bindings.map((binding: PlanBinding): PlanBindingNode =>
      readBindingNode(binding, seen),
    ),
    reference: false,
    service,
  };
}

function readBindingNode(
  binding: PlanBinding,
  seen: Set<string>,
): PlanBindingNode {
  switch (binding.type) {
    case 'ConstantValue':
      return {
        binding,
        type: 'ConstantValue',
      };
    case 'DynamicValue':
      return {
        binding,
        type: 'DynamicValue',
      };
    case 'Factory':
      return {
        binding,
        type: 'Factory',
      };
    case 'Instance':
      return {
        binding,
        constructorArguments: binding.constructorArguments.map(
          (service: PlanService | null): PlanServiceNode | null =>
            service === null ? null : readServiceNode(service, seen),
        ),
        properties: binding.properties.map(
          (property: PlanProperty): PlanPropertyNode => ({
            key: property.key,
            service: readServiceNode(property.service, seen),
          }),
        ),
        type: 'Instance',
      };
    case 'ResolvedValue':
      return {
        arguments: binding.arguments.map(
          (service: PlanService): PlanServiceNode =>
            readServiceNode(service, seen),
        ),
        binding,
        type: 'ResolvedValue',
      };
    case 'ServiceRedirection':
      return {
        binding,
        redirection: readServiceNode(binding.redirection, seen),
        type: 'ServiceRedirection',
      };
  }
}
