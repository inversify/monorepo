import { MultipleInjectionManagedClassElementMetadata } from './MultipleInjectionManagedClassElementMetadata';
import { SingleInjectionManagedClassElementMetadata } from './SingleInjectionManagedClassElementMetadata';

export type ManagedClassElementMetadata =
  | SingleInjectionManagedClassElementMetadata
  | MultipleInjectionManagedClassElementMetadata;
