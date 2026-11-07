import { type MetadataTag } from '../../metadata/models/MetadataTag.js';
import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';
import { type GetPlanOptions } from '../../planning/models/GetPlanOptions.js';

export function buildBuildServiceNodeOptionsFromGetPlanOptions(
  options: GetPlanOptions,
): BuildServiceNodeOptions {
  const tags: Map<MetadataTag, unknown> = new Map();

  if (options.tag !== undefined) {
    tags.set(options.tag.key, options.tag.value);
  }

  if (options.isMultiple) {
    return {
      chained: options.chained,
      isMultiple: true,
      name: options.name,
      optional: options.optional,
      serviceIdentifier: options.serviceIdentifier,
      tags,
    };
  }

  return {
    isMultiple: false,
    name: options.name,
    optional: options.optional,
    serviceIdentifier: options.serviceIdentifier,
    tags,
  };
}
