import { BindingScope, ServiceIdentifier } from 'inversify';

export interface ControllerOptions {
  path?: string;
  scope?: BindingScope;
  serviceIdentifier?: ServiceIdentifier;
}
