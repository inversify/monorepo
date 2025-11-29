import { BaseManagedClassElementMetadata } from './BaseManagedClassElementMetadata';
import { ClassElementMetadataKind } from './ClassElementMetadataKind';

export interface MultipleInjectionManagedClassElementMetadata extends BaseManagedClassElementMetadata<ClassElementMetadataKind.multipleInjection> {
  chained: boolean;
}
