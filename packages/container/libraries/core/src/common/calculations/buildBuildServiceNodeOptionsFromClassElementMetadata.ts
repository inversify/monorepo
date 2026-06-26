import {
  LazyServiceIdentifier,
  type ServiceIdentifier,
} from '@inversifyjs/common';

import { ClassElementMetadataKind } from '../../metadata/models/ClassElementMetadataKind.js';
import { type ManagedClassElementMetadata } from '../../metadata/models/ManagedClassElementMetadata.js';
import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';

export function buildBuildServiceNodeOptionsFromClassElementMetadata(
  elementMetadata: ManagedClassElementMetadata,
): BuildServiceNodeOptions {
  const serviceIdentifier: ServiceIdentifier = LazyServiceIdentifier.is(
    elementMetadata.value,
  )
    ? elementMetadata.value.unwrap()
    : elementMetadata.value;

  if (elementMetadata.kind === ClassElementMetadataKind.multipleInjection) {
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
