import {
  type LazyServiceIdentifier,
  type ServiceIdentifier,
} from '@inversifyjs/common';

import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';
import { type ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata.js';
import { type MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata.js';
import { type MultiInjectOptions } from '../models/MultiInjectOptions.js';
import { assertMetadataFromTypescriptIfManaged } from './assertMetadataFromTypescriptIfManaged.js';

export function buildManagedMetadataFromMaybeManagedMetadata(
  metadata: MaybeManagedClassElementMetadata | ManagedClassElementMetadata,
  kind: ClassElementMetadataKind.singleInjection,
  serviceIdentifier: ServiceIdentifier | LazyServiceIdentifier,
): ManagedClassElementMetadata;
export function buildManagedMetadataFromMaybeManagedMetadata(
  metadata: MaybeManagedClassElementMetadata | ManagedClassElementMetadata,
  kind: ClassElementMetadataKind.multipleInjection,
  serviceIdentifier: ServiceIdentifier | LazyServiceIdentifier,
  options: MultiInjectOptions | undefined,
): ManagedClassElementMetadata;
export function buildManagedMetadataFromMaybeManagedMetadata(
  metadata: MaybeManagedClassElementMetadata | ManagedClassElementMetadata,
  kind:
    | ClassElementMetadataKind.singleInjection
    | ClassElementMetadataKind.multipleInjection,
  serviceIdentifier: ServiceIdentifier | LazyServiceIdentifier,
  options?: MultiInjectOptions,
): ManagedClassElementMetadata {
  assertMetadataFromTypescriptIfManaged(metadata);

  if (kind === ClassElementMetadataKind.multipleInjection) {
    return {
      ...metadata,
      chained: options?.chained ?? false,
      kind,
      value: serviceIdentifier,
    };
  } else {
    return {
      ...metadata,
      kind,
      value: serviceIdentifier,
    };
  }
}
