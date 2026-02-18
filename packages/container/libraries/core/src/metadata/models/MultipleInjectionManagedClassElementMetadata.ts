import { type BaseManagedClassElementMetadata } from './BaseManagedClassElementMetadata.js';
import { type ClassElementMetadataKind } from './ClassElementMetadataKind.js';

export interface MultipleInjectionManagedClassElementMetadata extends BaseManagedClassElementMetadata<ClassElementMetadataKind.multipleInjection> {
  chained: boolean;
}
