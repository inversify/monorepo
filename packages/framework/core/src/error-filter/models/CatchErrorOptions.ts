import { type BindingScope, type Newable } from 'inversify';

export interface CatchErrorOptions {
  error?: Newable<Error>;
  scope?: BindingScope;
}
