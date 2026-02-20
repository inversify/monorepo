import {
  type LazyServiceIdentifier,
  type ServiceIdentifier,
} from '@inversifyjs/common';

import { type ClassElementMetadata } from '../models/ClassElementMetadata.js';
import { type ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';
import { type MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata.js';
import { type MultiInjectOptions } from '../models/MultiInjectOptions.js';
import { buildClassElementMetadataFromMaybeClassElementMetadata } from './buildClassElementMetadataFromMaybeClassElementMetadata.js';
import { buildDefaultManagedMetadata } from './buildDefaultManagedMetadata.js';
import { buildManagedMetadataFromMaybeManagedMetadata } from './buildManagedMetadataFromMaybeManagedMetadata.js';

export const buildManagedMetadataFromMaybeClassElementMetadata: ((
  kind: ClassElementMetadataKind.singleInjection,
  serviceIdentifier: ServiceIdentifier | LazyServiceIdentifier,
) => (
  metadata: MaybeClassElementMetadata | undefined,
) => ClassElementMetadata) &
  ((
    kind: ClassElementMetadataKind.multipleInjection,
    serviceIdentifier: ServiceIdentifier | LazyServiceIdentifier,
    options: MultiInjectOptions | undefined,
  ) => (
    metadata: MaybeClassElementMetadata | undefined,
  ) => ClassElementMetadata) =
  buildClassElementMetadataFromMaybeClassElementMetadata<
    [
      [
        ClassElementMetadataKind.singleInjection,
        ServiceIdentifier | LazyServiceIdentifier,
      ],
      [
        ClassElementMetadataKind.multipleInjection,
        ServiceIdentifier | LazyServiceIdentifier,
        MultiInjectOptions | undefined,
      ],
    ]
  >(buildDefaultManagedMetadata, buildManagedMetadataFromMaybeManagedMetadata);
