import { type ManagedClassElementMetadata } from './ManagedClassElementMetadata.js';
import { type MaybeManagedClassElementMetadata } from './MaybeManagedClassElementMetadata.js';
import { type UnmanagedClassElementMetadata } from './UnmanagedClassElementMetadata.js';

export type MaybeClassElementMetadata =
  | ManagedClassElementMetadata
  | MaybeManagedClassElementMetadata
  | UnmanagedClassElementMetadata;
