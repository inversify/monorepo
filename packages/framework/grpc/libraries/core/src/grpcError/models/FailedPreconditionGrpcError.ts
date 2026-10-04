import { type GrpcMetadata } from '../../grpcStatus/models/GrpcMetadata.js';
import { GrpcStatusCode } from '../../grpcStatus/models/GrpcStatusCode.js';
import { GrpcError } from './GrpcError.js';

export class FailedPreconditionGrpcError extends GrpcError {
  constructor(
    details: string = 'Failed Precondition',
    errorOptions?: ErrorOptions,
    metadata?: GrpcMetadata,
  ) {
    super(GrpcStatusCode.FAILED_PRECONDITION, details, errorOptions, metadata);
  }
}
