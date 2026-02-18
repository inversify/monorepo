import {
  type LazyServiceIdentifier,
  type ServiceIdentifier,
} from '@inversifyjs/common';

import { decrementPendingClassMetadataCount } from '../actions/decrementPendingClassMetadataCount.js';
import { buildManagedMetadataFromMaybeClassElementMetadata } from '../calculations/buildManagedMetadataFromMaybeClassElementMetadata.js';
import { type ClassElementMetadata } from '../models/ClassElementMetadata.js';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';
import { type MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata.js';
import { injectBase } from './injectBase.js';

export function inject(
  serviceIdentifier: ServiceIdentifier | LazyServiceIdentifier,
): MethodDecorator & ParameterDecorator & PropertyDecorator {
  const updateMetadata: (
    classElementMetadata: MaybeClassElementMetadata | undefined,
  ) => ClassElementMetadata = buildManagedMetadataFromMaybeClassElementMetadata(
    ClassElementMetadataKind.singleInjection,
    serviceIdentifier,
  );

  return injectBase(updateMetadata, decrementPendingClassMetadataCount);
}
