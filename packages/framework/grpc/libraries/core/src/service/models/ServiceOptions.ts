import { type BindingScope, type ServiceIdentifier } from 'inversify';

export interface ServiceOptions {
  scope?: BindingScope;
  serviceIdentifier?: ServiceIdentifier;
}
