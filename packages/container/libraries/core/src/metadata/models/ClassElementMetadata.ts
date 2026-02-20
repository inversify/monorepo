import { type ManagedClassElementMetadata } from './ManagedClassElementMetadata.js';
import { type UnmanagedClassElementMetadata } from './UnmanagedClassElementMetadata.js';

export type ClassElementMetadata =
  | ManagedClassElementMetadata
  | UnmanagedClassElementMetadata;
