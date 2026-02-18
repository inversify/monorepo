import type { AbstractNewable } from './AbstractNewable.js';
import type { Newable } from './Newable.js';

export type ServiceIdentifier<TInstance = unknown> =
  | string
  | symbol
  | Newable<TInstance>
  | AbstractNewable<TInstance>;
