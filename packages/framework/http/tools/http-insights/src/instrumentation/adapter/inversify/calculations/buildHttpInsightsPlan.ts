import {
  type MetadataName,
  type PlanBindingInspection,
  type PlanInspection,
  type PlanServiceInspection,
  type ServiceIdentifier,
} from 'inversify';

import { definePlanJson } from '../../../../insights/domain/calculations/definePlanJson.js';
import { type Plan } from '../../../../insights/domain/models/Plan.js';
import { type PlanBinding } from '../../../../insights/domain/models/PlanBinding.js';
import { type PlanJsonValue } from '../../../../insights/domain/models/PlanJsonValue.js';
import { type PlanMetadataKey } from '../../../../insights/domain/models/PlanMetadataKey.js';
import { type PlanProperty } from '../../../../insights/domain/models/PlanProperty.js';
import { type PlanService } from '../../../../insights/domain/models/PlanService.js';
import { type PlanServiceIdentifier } from '../../../../insights/domain/models/PlanServiceIdentifier.js';
import { type PlanTag } from '../../../../insights/domain/models/PlanTag.js';

export function buildHttpInsightsPlan(
  inspection: PlanInspection,
  readId: () => string,
): Plan {
  const services: WeakMap<PlanServiceInspection, PlanService> = new WeakMap();
  const bindings: WeakMap<PlanBindingInspection, PlanBinding> = new WeakMap();

  function readService(node: PlanServiceInspection): PlanService {
    const existing: PlanService | undefined = services.get(node);

    if (existing !== undefined) {
      return existing;
    }

    const serviceBindings: PlanBinding[] = [];
    const service: PlanService = {
      bindings: serviceBindings,
      chained: node.isMultiple ? node.chained : null,
      id: readId(),
      isMultiple: node.isMultiple,
      name: readOptionalMetadataKey(node.name),
      optional: node.optional,
      serviceIdentifier: readServiceIdentifier(node.serviceIdentifier),
      tags: readTags(node.tags),
    };

    services.set(node, service);
    definePlanJson(service);

    for (const binding of readBindingInspections(node)) {
      serviceBindings.push(readBinding(binding));
    }

    return service;
  }

  function readBinding(node: PlanBindingInspection): PlanBinding {
    const existing: PlanBinding | undefined = bindings.get(node);

    if (existing !== undefined) {
      return existing;
    }

    switch (node.type) {
      case 'ConstantValue':
      case 'Factory': {
        const binding: PlanBinding = {
          bindingId: node.id,
          id: readId(),
          moduleId: node.moduleId ?? null,
          scope: node.scope,
          serviceIdentifier: readServiceIdentifier(node.serviceIdentifier),
          type: node.type,
        };

        bindings.set(node, binding);

        return binding;
      }
      case 'DynamicValue': {
        const binding: PlanBinding = {
          bindingId: node.id,
          id: readId(),
          moduleId: node.moduleId ?? null,
          scope: node.scope,
          serviceIdentifier: readServiceIdentifier(node.serviceIdentifier),
          type: 'DynamicValue',
        };

        bindings.set(node, binding);

        return binding;
      }
      case 'Instance': {
        const constructorArguments: (PlanService | null)[] = [];
        const properties: PlanProperty[] = [];
        const binding: PlanBinding = {
          bindingId: node.id,
          constructorArguments,
          id: readId(),
          implementationType: readServiceIdentifier(node.implementationType),
          moduleId: node.moduleId ?? null,
          properties,
          scope: node.scope,
          serviceIdentifier: readServiceIdentifier(node.serviceIdentifier),
          type: 'Instance',
        };

        bindings.set(node, binding);

        for (const argument of node.constructorArguments) {
          constructorArguments.push(
            argument === undefined ? null : readService(argument),
          );
        }

        for (const [key, service] of node.properties) {
          properties.push({
            key: readPropertyKey(key),
            service: readService(service),
          });
        }

        return binding;
      }
      case 'ResolvedValue': {
        const resolvedArguments: PlanService[] = [];
        const binding: PlanBinding = {
          arguments: resolvedArguments,
          bindingId: node.id,
          id: readId(),
          moduleId: node.moduleId ?? null,
          scope: node.scope,
          serviceIdentifier: readServiceIdentifier(node.serviceIdentifier),
          type: 'ResolvedValue',
        };

        bindings.set(node, binding);

        for (const argument of node.arguments) {
          resolvedArguments.push(readService(argument));
        }

        return binding;
      }
      case 'ServiceRedirection': {
        const binding: PlanBinding = {
          bindingId: node.id,
          id: readId(),
          moduleId: node.moduleId ?? null,
          redirection: undefined as never,
          serviceIdentifier: readServiceIdentifier(node.serviceIdentifier),
          targetServiceIdentifier: readServiceIdentifier(
            node.targetServiceIdentifier,
          ),
          type: 'ServiceRedirection',
        };

        bindings.set(node, binding);
        assignRedirection(binding, readService(node.redirection));

        return binding;
      }
    }
  }

  return {
    id: readId(),
    root: readService(inspection.root),
  };
}

function assignRedirection(
  binding: PlanBinding,
  redirection: PlanService,
): void {
  if (binding.type !== 'ServiceRedirection') {
    return;
  }

  (binding as { redirection: PlanService }).redirection = redirection;
}

function readBindingInspections(
  service: PlanServiceInspection,
): readonly PlanBindingInspection[] {
  if (service.isMultiple) {
    return service.bindings;
  }

  if (service.binding === undefined) {
    return [];
  }

  return [service.binding];
}

function readFunctionName(serviceIdentifier: {
  readonly name: string;
}): string {
  if (serviceIdentifier.name === '') {
    return '(anonymous)';
  }

  return serviceIdentifier.name;
}

function readMetadataKey(key: MetadataName): PlanMetadataKey {
  switch (typeof key) {
    case 'number':
      return {
        kind: 'number',
        value: String(key),
      };
    case 'string':
      return {
        kind: 'string',
        value: key,
      };
    case 'symbol':
      return {
        kind: 'symbol',
        value: key.toString(),
      };
    default:
      throw new Error(`Unexpected ${typeof key} metadata key.`);
  }
}

function readOptionalMetadataKey(
  key: MetadataName | undefined,
): PlanMetadataKey | null {
  if (key === undefined) {
    return null;
  }

  return readMetadataKey(key);
}

function readPropertyKey(key: string | symbol): PlanMetadataKey {
  if (typeof key === 'string') {
    return {
      kind: 'string',
      value: key,
    };
  }

  return {
    kind: 'symbol',
    value: key.toString(),
  };
}

function readServiceIdentifier(
  serviceIdentifier: ServiceIdentifier,
): PlanServiceIdentifier {
  switch (typeof serviceIdentifier) {
    case 'function':
      return {
        kind: 'class',
        value: readFunctionName(serviceIdentifier),
      };
    case 'string':
      return {
        kind: 'string',
        value: serviceIdentifier,
      };
    case 'symbol':
      return {
        kind: 'symbol',
        value: serviceIdentifier.toString(),
      };
    default:
      throw new Error(
        `Unexpected ${typeof serviceIdentifier} service identifier.`,
      );
  }
}

function readTags(tags: PlanServiceInspection['tags']): PlanTag[] {
  const planTags: PlanTag[] = [];

  for (const [key, value] of tags) {
    planTags.push({
      key: readMetadataKey(key),
      value: toPlanJsonValue(value),
    });
  }

  return planTags;
}

function readJson(value: unknown, seen: WeakSet<object>): PlanJsonValue {
  if (value === undefined || value === null) {
    return null;
  }

  switch (typeof value) {
    case 'bigint':
      return value.toString();
    case 'boolean':
    case 'string':
      return value;
    case 'function':
    case 'symbol':
      return null;
    case 'number':
      return Number.isFinite(value) ? value : null;
    case 'object':
      return readJsonObject(value, seen);
    default:
      return null;
  }
}

function readJsonError(error: Error): PlanJsonValue {
  const json: { [key: string]: PlanJsonValue } = {
    message: error.message,
    name: error.name,
  };

  if (typeof error.stack === 'string') {
    json['stack'] = error.stack;
  }

  return json;
}

function readJsonObject(value: object, seen: WeakSet<object>): PlanJsonValue {
  if (seen.has(value)) {
    return null;
  }

  seen.add(value);

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Error) {
    return readJsonError(value);
  }

  if (Array.isArray(value)) {
    return value.map((item: unknown): PlanJsonValue => readJson(item, seen));
  }

  const json: { [key: string]: PlanJsonValue } = {};
  const record: Record<string, unknown> = value as Record<string, unknown>;

  for (const [key, entry] of Object.entries(record)) {
    json[key] = readJson(entry, seen);
  }

  return json;
}

function toPlanJsonValue(value: unknown): PlanJsonValue {
  return readJson(value, new WeakSet());
}
