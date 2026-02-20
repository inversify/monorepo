import { type BaseManagedClassElementMetadata } from './BaseManagedClassElementMetadata.js';
import { type ClassElementMetadataKind } from './ClassElementMetadataKind.js';

export type SingleInjectionManagedClassElementMetadata =
  BaseManagedClassElementMetadata<ClassElementMetadataKind.singleInjection>;
