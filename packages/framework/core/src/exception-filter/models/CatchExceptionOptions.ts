import { BindingScope, Newable } from 'inversify';

export interface CatchExceptionOptions {
  error?: Newable<Error>;
  scope?: BindingScope;
}
