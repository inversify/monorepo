import { ServiceIdentifier } from 'inversify';

export interface ControllerMetadata {
  path: string;
  serviceIdentifier: ServiceIdentifier;
  target: NewableFunction;
}
