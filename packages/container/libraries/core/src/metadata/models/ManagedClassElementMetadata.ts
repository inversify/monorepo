import { type MultipleInjectionManagedClassElementMetadata } from './MultipleInjectionManagedClassElementMetadata.js';
import { type SingleInjectionManagedClassElementMetadata } from './SingleInjectionManagedClassElementMetadata.js';

export type ManagedClassElementMetadata =
  | SingleInjectionManagedClassElementMetadata
  | MultipleInjectionManagedClassElementMetadata;
