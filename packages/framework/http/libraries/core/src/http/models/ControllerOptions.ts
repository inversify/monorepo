import { BindingScope } from 'inversify';

export interface ControllerOptions {
  path?: string;
  scope?: BindingScope;
}
