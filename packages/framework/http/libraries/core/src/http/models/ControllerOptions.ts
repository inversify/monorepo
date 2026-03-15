import { type BindingScope, type ServiceIdentifier } from 'inversify';

export interface ControllerOptions {
  path?: string;
  priority?: number;
  scope?: BindingScope;
  serviceIdentifier?: ServiceIdentifier;
}
