import { type ServiceIdentifier } from 'inversify';

import { type GrpcServiceDefinition } from './GrpcServiceDefinition.js';

export interface ServiceMetadata {
  definition: GrpcServiceDefinition;
  serviceIdentifier: ServiceIdentifier;
  target: NewableFunction;
}
