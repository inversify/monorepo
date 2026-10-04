import { type GrpcMetadata } from '../../grpcStatus/models/GrpcMetadata.js';
import { GrpcStatusCode } from '../../grpcStatus/models/GrpcStatusCode.js';
import { GrpcError } from './GrpcError.js';

export class ResourceExhaustedGrpcError extends GrpcError {
  constructor(
    details: string = 'Resource Exhausted',
    errorOptions?: ErrorOptions,
    metadata?: GrpcMetadata,
  ) {
    super(GrpcStatusCode.RESOURCE_EXHAUSTED, details, errorOptions, metadata);
  }
}
