import { randomUUID } from 'node:crypto';

import { Prisma } from '../../../../generated/prisma/client.js';
import { type Plan } from '../../../domain/models/Plan.js';
import { type PlanBinding } from '../../../domain/models/PlanBinding.js';
import { type PlanJsonValue } from '../../../domain/models/PlanJsonValue.js';
import { type PlanService } from '../../../domain/models/PlanService.js';

export interface PlanOwner {
  readonly controllerId: string | null;
  readonly guardId: string | null;
  readonly interceptorId: string | null;
  readonly middlewareId: string | null;
  readonly pipeId: string | null;
}

export interface PlanRows {
  readonly bindings: readonly Prisma.PlanBindingCreateManyInput[];
  readonly dependencies: readonly Prisma.PlanBindingDependencyCreateManyInput[];
  readonly plan: Prisma.PlanCreateManyInput;
  readonly serviceBindings: readonly Prisma.PlanServiceBindingCreateManyInput[];
  readonly services: readonly Prisma.PlanServiceCreateManyInput[];
  readonly tags: readonly Prisma.PlanServiceTagCreateManyInput[];
}

export function readPlanRows(
  plan: Plan,
  owner: PlanOwner,
  readId: () => string = randomUUID,
): PlanRows {
  const services: Prisma.PlanServiceCreateManyInput[] = [];
  const bindings: Prisma.PlanBindingCreateManyInput[] = [];
  const tags: Prisma.PlanServiceTagCreateManyInput[] = [];
  const serviceBindings: Prisma.PlanServiceBindingCreateManyInput[] = [];
  const dependencies: Prisma.PlanBindingDependencyCreateManyInput[] = [];
  const seenServices: Set<PlanService> = new Set();
  const seenBindings: Set<PlanBinding> = new Set();

  const visitService = (service: PlanService, isRoot: boolean): void => {
    if (seenServices.has(service)) {
      return;
    }

    seenServices.add(service);
    services.push(readServiceRow(plan.id, service, isRoot));

    for (const [position, tag] of service.tags.entries()) {
      tags.push({
        id: readId(),
        key_kind: tag.key.kind,
        key_value: tag.key.value,
        position,
        service_id: service.id,
        value: readTagValue(tag.value),
      });
    }

    for (const [position, binding] of service.bindings.entries()) {
      serviceBindings.push({
        binding_id: binding.id,
        position,
        service_id: service.id,
      });
      visitBinding(binding);
    }
  };

  const visitBinding = (binding: PlanBinding): void => {
    if (seenBindings.has(binding)) {
      return;
    }

    seenBindings.add(binding);
    bindings.push(readBindingRow(plan.id, binding));

    switch (binding.type) {
      case 'ConstantValue':
      case 'DynamicValue':
      case 'Factory':
        break;
      case 'Instance':
        for (const [
          position,
          service,
        ] of binding.constructorArguments.entries()) {
          dependencies.push({
            binding_id: binding.id,
            id: readId(),
            key_kind: null,
            key_value: null,
            kind: 'constructorArgument',
            position,
            service_id: service === null ? null : service.id,
          });

          if (service !== null) {
            visitService(service, false);
          }
        }

        for (const [position, property] of binding.properties.entries()) {
          dependencies.push({
            binding_id: binding.id,
            id: readId(),
            key_kind: property.key.kind,
            key_value: property.key.value,
            kind: 'property',
            position,
            service_id: property.service.id,
          });
          visitService(property.service, false);
        }

        break;
      case 'ResolvedValue':
        for (const [position, service] of binding.arguments.entries()) {
          dependencies.push({
            binding_id: binding.id,
            id: readId(),
            key_kind: null,
            key_value: null,
            kind: 'resolvedArgument',
            position,
            service_id: service.id,
          });
          visitService(service, false);
        }

        break;
      case 'ServiceRedirection':
        dependencies.push({
          binding_id: binding.id,
          id: readId(),
          key_kind: null,
          key_value: null,
          kind: 'redirection',
          position: 0,
          service_id: binding.redirection.id,
        });
        visitService(binding.redirection, false);
        break;
    }
  };

  visitService(plan.root, true);

  return {
    bindings,
    dependencies,
    plan: {
      controller_id: owner.controllerId,
      guard_id: owner.guardId,
      id: plan.id,
      interceptor_id: owner.interceptorId,
      middleware_id: owner.middlewareId,
      pipe_id: owner.pipeId,
    },
    serviceBindings,
    services,
    tags,
  };
}

function readBindingRow(
  planId: string,
  binding: PlanBinding,
): Prisma.PlanBindingCreateManyInput {
  const implementationType: PlanService['serviceIdentifier'] | null =
    binding.type === 'Instance' ? binding.implementationType : null;
  const targetServiceIdentifier: PlanService['serviceIdentifier'] | null =
    binding.type === 'ServiceRedirection'
      ? binding.targetServiceIdentifier
      : null;

  return {
    binding_identifier: binding.bindingId,
    id: binding.id,
    implementation_type_kind: implementationType?.kind ?? null,
    implementation_type_value: implementationType?.value ?? null,
    module_id: binding.moduleId,
    plan_id: planId,
    scope: 'scope' in binding ? binding.scope : null,
    service_identifier_kind: binding.serviceIdentifier.kind,
    service_identifier_value: binding.serviceIdentifier.value,
    target_service_identifier_kind: targetServiceIdentifier?.kind ?? null,
    target_service_identifier_value: targetServiceIdentifier?.value ?? null,
    type: binding.type,
  };
}

function readServiceRow(
  planId: string,
  service: PlanService,
  isRoot: boolean,
): Prisma.PlanServiceCreateManyInput {
  return {
    chained: service.chained,
    id: service.id,
    is_multiple: service.isMultiple,
    is_root: isRoot,
    name_kind: service.name?.kind ?? null,
    name_value: service.name?.value ?? null,
    optional: service.optional,
    plan_id: planId,
    service_identifier_kind: service.serviceIdentifier.kind,
    service_identifier_value: service.serviceIdentifier.value,
  };
}

function readTagValue(
  value: PlanJsonValue,
): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  if (value === null) {
    return Prisma.JsonNull;
  }

  return value;
}
