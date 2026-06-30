import {
  LazyServiceIdentifier,
  type ServiceIdentifier,
} from '@inversifyjs/common';

import { type MetadataTag } from '../../metadata/models/MetadataTag.js';
import { type BuildServiceNodeOptions } from '../models/BuildServiceNodeOptions.js';
import { type GetPlanOptions } from '../models/GetPlanOptions.js';
import { type GetPlanOptionsTagConstraint } from '../models/GetPlanOptionsTagConstraint.js';

export function tryBuildGetPlanOptionsFromBuildServiceNodeOptions(
  options: BuildServiceNodeOptions,
): GetPlanOptions | undefined {
  let tag: GetPlanOptionsTagConstraint | undefined;

  if (options.tags.size === 0) {
    tag = undefined;
  } else if (options.tags.size === 1) {
    const [key, value]: [MetadataTag, unknown] = options.tags.entries().next()
      .value as [MetadataTag, unknown];
    tag = { key, value };
  } else {
    return undefined;
  }

  const serviceIdentifier: ServiceIdentifier = LazyServiceIdentifier.is(
    options.serviceIdentifier,
  )
    ? options.serviceIdentifier.unwrap()
    : options.serviceIdentifier;

  if (options.isMultiple) {
    return {
      chained: options.chained,
      isMultiple: true,
      name: options.name,
      optional: options.optional,
      serviceIdentifier,
      tag,
    };
  } else {
    return {
      isMultiple: false,
      name: options.name,
      optional: options.optional,
      serviceIdentifier,
      tag,
    };
  }
}
