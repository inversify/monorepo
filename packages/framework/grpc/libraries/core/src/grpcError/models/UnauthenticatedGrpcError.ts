import { type GrpcMetadata } from '../../grpcStatus/models/GrpcMetadata.js';
import { GrpcStatusCode } from '../../grpcStatus/models/GrpcStatusCode.js';
import { GrpcError } from './GrpcError.js';

export class UnauthenticatedGrpcError extends GrpcError {
  constructor(
    details: string = 'Unauthenticated',
    errorOptions?: ErrorOptions,
    metadata?: GrpcMetadata,
  ) {
    super(GrpcStatusCode.UNAUTHENTICATED, details, errorOptions, metadata);
  }
}
