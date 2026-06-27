import { type MetadataTag } from '../../metadata/models/MetadataTag.js';
import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';
import { type PlanParamsConstraint } from '../../planning/models/PlanParamsConstraint.js';

export function buildBuildServiceNodeOptionsFromPlanParamsConstraints(
  constraints: PlanParamsConstraint,
): BuildServiceNodeOptions {
  const tags: Map<MetadataTag, unknown> = new Map();

  if (constraints.tag !== undefined) {
    tags.set(constraints.tag.key, constraints.tag.value);
  }

  if (constraints.isMultiple) {
    return {
      chained: constraints.chained,
      isMultiple: constraints.isMultiple,
      name: constraints.name,
      optional: constraints.isOptional ?? false,
      serviceIdentifier: constraints.serviceIdentifier,
      tags,
    };
  }

  return {
    isMultiple: constraints.isMultiple,
    name: constraints.name,
    optional: constraints.isOptional ?? false,
    serviceIdentifier: constraints.serviceIdentifier,
    tags,
  };
}
