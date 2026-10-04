import { type GrpcMetadata } from '../../grpcStatus/models/GrpcMetadata.js';
import { GrpcStatusCode } from '../../grpcStatus/models/GrpcStatusCode.js';
import { GrpcError } from './GrpcError.js';

export class UnavailableGrpcError extends GrpcError {
  constructor(
    details: string = 'Unavailable',
    errorOptions?: ErrorOptions,
    metadata?: GrpcMetadata,
  ) {
    super(GrpcStatusCode.UNAVAILABLE, details, errorOptions, metadata);
  }
}
