import { type PlanBinding } from '../models/PlanBinding.js';
import { type PlanProperty } from '../models/PlanProperty.js';
import { type PlanService } from '../models/PlanService.js';

export function definePlanJson(service: PlanService): void {
  Object.defineProperty(service, 'toJSON', {
    configurable: true,
    enumerable: false,
    value: readPlanServiceJsonMethod,
    writable: false,
  });
}

function readPlanServiceJsonMethod(this: PlanService): object {
  return readPlanServiceJson(this, new WeakSet());
}

function readPlanServiceJson(
  service: PlanService,
  seen: WeakSet<PlanService>,
): object {
  if (seen.has(service)) {
    return {
      id: service.id,
    };
  }

  seen.add(service);

  return {
    bindings: service.bindings.map((binding: PlanBinding): object =>
      readPlanBindingJson(binding, seen),
    ),
    chained: service.chained,
    id: service.id,
    isMultiple: service.isMultiple,
    name: service.name,
    optional: service.optional,
    serviceIdentifier: service.serviceIdentifier,
    tags: service.tags,
  };
}

function readPlanBindingJson(
  binding: PlanBinding,
  seen: WeakSet<PlanService>,
): object {
  switch (binding.type) {
    case 'ConstantValue':
    case 'Factory':
      return {
        bindingId: binding.bindingId,
        id: binding.id,
        moduleId: binding.moduleId,
        scope: binding.scope,
        serviceIdentifier: binding.serviceIdentifier,
        type: binding.type,
      };
    case 'DynamicValue':
      return {
        bindingId: binding.bindingId,
        id: binding.id,
        moduleId: binding.moduleId,
        scope: binding.scope,
        serviceIdentifier: binding.serviceIdentifier,
        type: 'DynamicValue',
      };
    case 'Instance':
      return {
        bindingId: binding.bindingId,
        constructorArguments: binding.constructorArguments.map(
          (service: PlanService | null): object | null =>
            service === null ? null : readPlanServiceJson(service, seen),
        ),
        id: binding.id,
        implementationType: binding.implementationType,
        moduleId: binding.moduleId,
        properties: binding.properties.map(
          (property: PlanProperty): object => ({
            key: property.key,
            service: readPlanServiceJson(property.service, seen),
          }),
        ),
        scope: binding.scope,
        serviceIdentifier: binding.serviceIdentifier,
        type: 'Instance',
      };
    case 'ResolvedValue':
      return {
        arguments: binding.arguments.map((service: PlanService): object =>
          readPlanServiceJson(service, seen),
        ),
        bindingId: binding.bindingId,
        id: binding.id,
        moduleId: binding.moduleId,
        scope: binding.scope,
        serviceIdentifier: binding.serviceIdentifier,
        type: 'ResolvedValue',
      };
    case 'ServiceRedirection':
      return {
        bindingId: binding.bindingId,
        id: binding.id,
        moduleId: binding.moduleId,
        redirection: readPlanServiceJson(binding.redirection, seen),
        serviceIdentifier: binding.serviceIdentifier,
        targetServiceIdentifier: binding.targetServiceIdentifier,
        type: 'ServiceRedirection',
      };
  }
}
