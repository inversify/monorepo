import { Newable } from './Newable';

export type ServiceIdentifier<TInstance = unknown> =
  | string
  | symbol
  | Newable<TInstance>;
