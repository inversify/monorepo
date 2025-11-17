import { ServiceIdentifier } from 'inversify';

export interface ControllerMetadata {
  path: string;
  priority: number;
  serviceIdentifier: ServiceIdentifier;
  target: NewableFunction;
}
