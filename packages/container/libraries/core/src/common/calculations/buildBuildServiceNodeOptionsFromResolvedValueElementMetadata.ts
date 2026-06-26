import {
  LazyServiceIdentifier,
  type ServiceIdentifier,
} from '@inversifyjs/common';

import { type ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata.js';
import { ResolvedValueElementMetadataKind } from '../../metadata/models/ResolvedValueElementMetadataKind.js';
import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';

export function buildBuildServiceNodeOptionsFromResolvedValueElementMetadata(
  elementMetadata: ResolvedValueElementMetadata,
): BuildServiceNodeOptions {
  const serviceIdentifier: ServiceIdentifier = LazyServiceIdentifier.is(
    elementMetadata.value,
  )
    ? elementMetadata.value.unwrap()
    : elementMetadata.value;

  if (
    elementMetadata.kind === ResolvedValueElementMetadataKind.multipleInjection
  ) {
    return {
      chained: elementMetadata.chained,
      isMultiple: true,
      name: elementMetadata.name,
      optional: elementMetadata.optional,
      serviceIdentifier,
      tags: elementMetadata.tags,
    };
  }

  return {
    isMultiple: false,
    name: elementMetadata.name,
    optional: elementMetadata.optional,
    serviceIdentifier,
    tags: elementMetadata.tags,
  };
}
