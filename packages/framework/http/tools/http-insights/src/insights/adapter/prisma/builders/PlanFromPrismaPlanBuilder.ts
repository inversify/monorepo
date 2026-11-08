import { injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type Prisma } from '../../../../generated/prisma/client.js';
import { definePlanJson } from '../../../domain/calculations/definePlanJson.js';
import { type Plan } from '../../../domain/models/Plan.js';
import {
  type PlanBinding,
  type PlanBindingScope,
} from '../../../domain/models/PlanBinding.js';
import { type PlanJsonValue } from '../../../domain/models/PlanJsonValue.js';
import { type PlanMetadataKey } from '../../../domain/models/PlanMetadataKey.js';
import { type PlanProperty } from '../../../domain/models/PlanProperty.js';
import { type PlanService } from '../../../domain/models/PlanService.js';
import { type PlanServiceIdentifier } from '../../../domain/models/PlanServiceIdentifier.js';
import { type PlanTag } from '../../../domain/models/PlanTag.js';
import { type PrismaPlanWithGraph } from './prismaPlanInclude.js';

type PrismaPlanBindingRow = PrismaPlanWithGraph['bindings'][number];
type PrismaPlanDependencyRow = PrismaPlanBindingRow['dependencies'][number];
type PrismaPlanServiceRow = PrismaPlanWithGraph['services'][number];

interface MutablePlanService extends PlanService {
  bindings: PlanBinding[];
}

@injectable()
export class PlanFromPrismaPlanBuilder implements Builder<
  PrismaPlanWithGraph,
  Plan
> {
  public build(input: PrismaPlanWithGraph): Plan {
    const services: Map<string, MutablePlanService> = new Map();

    for (const row of input.services) {
      if (services.has(row.id)) {
        throw new Error(
          `Plan "${input.id}" has duplicate service "${row.id}".`,
        );
      }

      services.set(row.id, readServiceShell(row));
    }

    const bindings: Map<string, PlanBinding> = new Map();

    for (const row of input.bindings) {
      if (bindings.has(row.id)) {
        throw new Error(
          `Plan "${input.id}" has duplicate binding "${row.id}".`,
        );
      }

      bindings.set(row.id, readBinding(row, services));
    }

    for (const row of input.services) {
      const service: MutablePlanService | undefined = services.get(row.id);

      if (service === undefined) {
        throw new Error(`Plan service "${row.id}" was not built.`);
      }

      service.bindings.push(...readServiceBindings(row, bindings));
    }

    const roots: PrismaPlanServiceRow[] = input.services.filter(
      (service: PrismaPlanServiceRow): boolean => service.is_root,
    );

    if (roots.length !== 1) {
      throw new Error(`Plan "${input.id}" has ${String(roots.length)} roots.`);
    }

    const rootRow: PrismaPlanServiceRow | undefined = roots[0];

    if (rootRow === undefined) {
      throw new Error(`Plan "${input.id}" has no root.`);
    }

    const root: MutablePlanService | undefined = services.get(rootRow.id);

    if (root === undefined) {
      throw new Error(`Plan service "${rootRow.id}" was not built.`);
    }

    return {
      id: input.id,
      root,
    };
  }
}

function readBinding(
  row: PrismaPlanBindingRow,
  services: ReadonlyMap<string, PlanService>,
): PlanBinding {
  const serviceIdentifier: PlanServiceIdentifier = readServiceIdentifier(
    row.service_identifier_kind,
    row.service_identifier_value,
    `Plan binding "${row.id}"`,
  );

  switch (row.type) {
    case 'ConstantValue':
    case 'Factory':
      readAbsentDependencies(row);
      readAbsentImplementation(row);
      readAbsentTarget(row);

      return {
        bindingId: row.binding_identifier,
        id: row.id,
        moduleId: row.module_id,
        scope: readSingletonScope(row.scope, row.id),
        serviceIdentifier,
        type: row.type,
      };
    case 'DynamicValue':
      readAbsentDependencies(row);
      readAbsentImplementation(row);
      readAbsentTarget(row);

      return {
        bindingId: row.binding_identifier,
        id: row.id,
        moduleId: row.module_id,
        scope: readBindingScope(row.scope, row.id),
        serviceIdentifier,
        type: 'DynamicValue',
      };
    case 'Instance':
      readAbsentTarget(row);

      return {
        bindingId: row.binding_identifier,
        constructorArguments: readConstructorArguments(row, services),
        id: row.id,
        implementationType: readImplementationType(row),
        moduleId: row.module_id,
        properties: readProperties(row, services),
        scope: readBindingScope(row.scope, row.id),
        serviceIdentifier,
        type: 'Instance',
      };
    case 'ResolvedValue':
      readAbsentImplementation(row);
      readAbsentTarget(row);

      return {
        arguments: readResolvedArguments(row, services),
        bindingId: row.binding_identifier,
        id: row.id,
        moduleId: row.module_id,
        scope: readBindingScope(row.scope, row.id),
        serviceIdentifier,
        type: 'ResolvedValue',
      };
    case 'ServiceRedirection':
      readAbsentImplementation(row);
      readAbsentScope(row);

      return {
        bindingId: row.binding_identifier,
        id: row.id,
        moduleId: row.module_id,
        redirection: readRedirection(row, services),
        serviceIdentifier,
        targetServiceIdentifier: readTargetServiceIdentifier(row),
        type: 'ServiceRedirection',
      };
    default:
      return throwUnknownBindingType(row.id, row.type);
  }
}

function throwUnknownBindingType(bindingId: string, type: string): never {
  throw new Error(`Plan binding "${bindingId}" has unknown type "${type}".`);
}

function readAbsentDependencies(row: PrismaPlanBindingRow): void {
  readExpectedDependencyKinds(row, []);
}

function readAbsentImplementation(row: PrismaPlanBindingRow): void {
  if (
    row.implementation_type_kind !== null ||
    row.implementation_type_value !== null
  ) {
    throw new Error(
      `Plan binding "${row.id}" must not have an implementation type.`,
    );
  }
}

function readAbsentScope(row: PrismaPlanBindingRow): void {
  if (row.scope !== null) {
    throw new Error(`Plan binding "${row.id}" must not have a scope.`);
  }
}

function readAbsentTarget(row: PrismaPlanBindingRow): void {
  if (
    row.target_service_identifier_kind !== null ||
    row.target_service_identifier_value !== null
  ) {
    throw new Error(
      `Plan binding "${row.id}" must not have a target service identifier.`,
    );
  }
}

function readBindingScope(
  scope: string | null,
  bindingId: string,
): PlanBindingScope {
  switch (scope) {
    case 'Request':
    case 'Singleton':
    case 'Transient':
      return scope;
    default:
      throw new Error(
        `Plan binding "${bindingId}" has unknown scope "${scope ?? 'null'}".`,
      );
  }
}

function readConstructorArguments(
  row: PrismaPlanBindingRow,
  services: ReadonlyMap<string, PlanService>,
): readonly (PlanService | null)[] {
  readExpectedDependencyKinds(row, ['constructorArgument', 'property']);

  return readDependencies(row, 'constructorArgument').map(
    (dependency: PrismaPlanDependencyRow): PlanService | null =>
      readLinkedService(dependency, services, true),
  );
}

function readDependencies(
  row: PrismaPlanBindingRow,
  kind: string,
): PrismaPlanDependencyRow[] {
  const dependencies: PrismaPlanDependencyRow[] = row.dependencies
    .filter(
      (dependency: PrismaPlanDependencyRow): boolean =>
        dependency.kind === kind,
    )
    .sort(
      (left: PrismaPlanDependencyRow, right: PrismaPlanDependencyRow): number =>
        left.position - right.position,
    );

  for (const [index, dependency] of dependencies.entries()) {
    if (dependency.position !== index) {
      throw new Error(
        `Plan binding "${row.id}" has a gap in "${kind}" dependencies.`,
      );
    }
  }

  return dependencies;
}

function readExpectedDependencyKinds(
  row: PrismaPlanBindingRow,
  kinds: readonly string[],
): void {
  for (const dependency of row.dependencies) {
    if (!kinds.includes(dependency.kind)) {
      throw new Error(
        `Plan binding "${row.id}" has unexpected dependency kind "${dependency.kind}".`,
      );
    }
  }
}

function readImplementationType(
  row: PrismaPlanBindingRow,
): PlanServiceIdentifier {
  if (
    row.implementation_type_kind !== 'class' ||
    row.implementation_type_value === null
  ) {
    throw new Error(
      `Plan binding "${row.id}" is missing its implementation type.`,
    );
  }

  return {
    kind: 'class',
    value: row.implementation_type_value,
  };
}

function readLinkedService(
  dependency: PrismaPlanDependencyRow,
  services: ReadonlyMap<string, PlanService>,
  optional: boolean,
): PlanService | null {
  if (dependency.service_id === null) {
    if (optional) {
      return null;
    }

    throw new Error(
      `Plan dependency "${dependency.id}" is missing its service.`,
    );
  }

  const service: PlanService | undefined = services.get(dependency.service_id);

  if (service === undefined) {
    throw new Error(
      `Plan dependency "${dependency.id}" points at missing service "${dependency.service_id}".`,
    );
  }

  return service;
}

function readMetadataKey(
  kind: string,
  value: string,
  subject: string,
): PlanMetadataKey {
  switch (kind) {
    case 'number':
    case 'string':
    case 'symbol':
      return {
        kind,
        value,
      };
    default:
      throw new Error(`${subject} has unknown metadata key kind "${kind}".`);
  }
}

function readOptionalMetadataKey(
  kind: string | null,
  value: string | null,
  subject: string,
): PlanMetadataKey | null {
  if (kind === null && value === null) {
    return null;
  }

  if (kind === null || value === null) {
    throw new Error(`${subject} has an incomplete metadata key.`);
  }

  return readMetadataKey(kind, value, subject);
}

function readPlanJsonValue(
  value: Prisma.JsonValue,
  subject: string,
): PlanJsonValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item: Prisma.JsonValue, index: number): PlanJsonValue =>
      readPlanJsonValue(item, `${subject}[${String(index)}]`),
    );
  }

  const json: { [key: string]: PlanJsonValue } = {};

  for (const [key, entry] of Object.entries(value)) {
    if (entry === undefined) {
      continue;
    }

    json[key] = readPlanJsonValue(entry, `${subject}.${key}`);
  }

  return json;
}

function readProperties(
  row: PrismaPlanBindingRow,
  services: ReadonlyMap<string, PlanService>,
): readonly PlanProperty[] {
  return readDependencies(row, 'property').map(
    (dependency: PrismaPlanDependencyRow): PlanProperty => {
      if (dependency.key_kind === null || dependency.key_value === null) {
        throw new Error(
          `Plan dependency "${dependency.id}" is missing its key.`,
        );
      }

      const key: PlanMetadataKey = readMetadataKey(
        dependency.key_kind,
        dependency.key_value,
        `Plan dependency "${dependency.id}"`,
      );

      if (key.kind === 'number') {
        throw new Error(
          `Plan dependency "${dependency.id}" has a numeric property key.`,
        );
      }

      const service: PlanService | null = readLinkedService(
        dependency,
        services,
        false,
      );

      if (service === null) {
        throw new Error(
          `Plan dependency "${dependency.id}" is missing its service.`,
        );
      }

      return {
        key,
        service,
      };
    },
  );
}

function readRedirection(
  row: PrismaPlanBindingRow,
  services: ReadonlyMap<string, PlanService>,
): PlanService {
  readExpectedDependencyKinds(row, ['redirection']);

  const dependencies: PrismaPlanDependencyRow[] = readDependencies(
    row,
    'redirection',
  );
  const dependency: PrismaPlanDependencyRow | undefined = dependencies[0];

  if (dependencies.length !== 1 || dependency === undefined) {
    throw new Error(`Plan binding "${row.id}" must redirect to one service.`);
  }

  const service: PlanService | null = readLinkedService(
    dependency,
    services,
    false,
  );

  if (service === null) {
    throw new Error(`Plan binding "${row.id}" must redirect to one service.`);
  }

  return service;
}

function readResolvedArguments(
  row: PrismaPlanBindingRow,
  services: ReadonlyMap<string, PlanService>,
): readonly PlanService[] {
  readExpectedDependencyKinds(row, ['resolvedArgument']);

  return readDependencies(row, 'resolvedArgument').map(
    (dependency: PrismaPlanDependencyRow): PlanService => {
      const service: PlanService | null = readLinkedService(
        dependency,
        services,
        false,
      );

      if (service === null) {
        throw new Error(
          `Plan dependency "${dependency.id}" is missing its service.`,
        );
      }

      return service;
    },
  );
}

function readServiceBindings(
  row: PrismaPlanServiceRow,
  bindings: ReadonlyMap<string, PlanBinding>,
): PlanBinding[] {
  const links: PrismaPlanServiceRow['serviceBindings'][number][] = [
    ...row.serviceBindings,
  ].sort(
    (
      left: PrismaPlanServiceRow['serviceBindings'][number],
      right: PrismaPlanServiceRow['serviceBindings'][number],
    ): number => left.position - right.position,
  );
  const serviceBindings: PlanBinding[] = [];

  for (const [index, link] of links.entries()) {
    if (link.position !== index) {
      throw new Error(`Plan service "${row.id}" has a gap in its bindings.`);
    }

    const binding: PlanBinding | undefined = bindings.get(link.binding_id);

    if (binding === undefined) {
      throw new Error(
        `Plan service "${row.id}" points at missing binding "${link.binding_id}".`,
      );
    }

    serviceBindings.push(binding);
  }

  if (!row.is_multiple && serviceBindings.length > 1) {
    throw new Error(
      `Plan service "${row.id}" is not multiple and has ${String(serviceBindings.length)} bindings.`,
    );
  }

  return serviceBindings;
}

function readServiceIdentifier(
  kind: string,
  value: string,
  subject: string,
): PlanServiceIdentifier {
  switch (kind) {
    case 'class':
    case 'string':
    case 'symbol':
      return {
        kind,
        value,
      };
    default:
      throw new Error(
        `${subject} has unknown service identifier kind "${kind}".`,
      );
  }
}

function readServiceShell(row: PrismaPlanServiceRow): MutablePlanService {
  const service: MutablePlanService = {
    bindings: [],
    chained: readChained(row),
    id: row.id,
    isMultiple: row.is_multiple,
    name: readOptionalMetadataKey(
      row.name_kind,
      row.name_value,
      `Plan service "${row.id}"`,
    ),
    optional: row.optional,
    serviceIdentifier: readServiceIdentifier(
      row.service_identifier_kind,
      row.service_identifier_value,
      `Plan service "${row.id}"`,
    ),
    tags: row.tags.map(
      (tag: PrismaPlanServiceRow['tags'][number]): PlanTag => ({
        key: readMetadataKey(
          tag.key_kind,
          tag.key_value,
          `Plan tag "${tag.id}"`,
        ),
        value: readPlanJsonValue(tag.value, `Plan tag "${tag.id}"`),
      }),
    ),
  };

  definePlanJson(service);

  return service;
}

function readChained(row: PrismaPlanServiceRow): boolean | null {
  if (!row.is_multiple) {
    if (row.chained !== null) {
      throw new Error(
        `Plan service "${row.id}" is not multiple and must not be chained.`,
      );
    }

    return null;
  }

  if (row.chained === null) {
    throw new Error(
      `Plan service "${row.id}" is multiple and must be chained or not.`,
    );
  }

  return row.chained;
}

function readSingletonScope(
  scope: string | null,
  bindingId: string,
): 'Singleton' {
  if (scope !== 'Singleton') {
    throw new Error(`Plan binding "${bindingId}" must have Singleton scope.`);
  }

  return 'Singleton';
}

function readTargetServiceIdentifier(
  row: PrismaPlanBindingRow,
): PlanServiceIdentifier {
  if (
    row.target_service_identifier_kind === null ||
    row.target_service_identifier_value === null
  ) {
    throw new Error(
      `Plan binding "${row.id}" is missing its target service identifier.`,
    );
  }

  return readServiceIdentifier(
    row.target_service_identifier_kind,
    row.target_service_identifier_value,
    `Plan binding "${row.id}"`,
  );
}
