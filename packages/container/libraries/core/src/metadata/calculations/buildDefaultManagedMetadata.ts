import {
  type LazyServiceIdentifier,
  type ServiceIdentifier,
} from '@inversifyjs/common';

import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';
import { type ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata.js';
import { type MultiInjectOptions } from '../models/MultiInjectOptions.js';

export function buildDefaultManagedMetadata(
  kind: ClassElementMetadataKind.singleInjection,
  serviceIdentifier: ServiceIdentifier | LazyServiceIdentifier,
): ManagedClassElementMetadata;
export function buildDefaultManagedMetadata(
  kind: ClassElementMetadataKind.multipleInjection,
  serviceIdentifier: ServiceIdentifier | LazyServiceIdentifier,
  options: MultiInjectOptions | undefined,
): ManagedClassElementMetadata;
export function buildDefaultManagedMetadata(
  kind:
    | ClassElementMetadataKind.singleInjection
    | ClassElementMetadataKind.multipleInjection,
  serviceIdentifier: ServiceIdentifier | LazyServiceIdentifier,
  options?: MultiInjectOptions,
): ManagedClassElementMetadata {
  if (kind === ClassElementMetadataKind.multipleInjection) {
    return {
      chained: options?.chained ?? false,
      kind,
      name: undefined,
      optional: false,
      tags: new Map(),
      value: serviceIdentifier,
    };
  } else {
    return {
      kind,
      name: undefined,
      optional: false,
      tags: new Map(),
      value: serviceIdentifier,
    };
  }
}
