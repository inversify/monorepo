import { type GrpcMetadata } from '../../grpcStatus/models/GrpcMetadata.js';
import { GrpcStatusCode } from '../../grpcStatus/models/GrpcStatusCode.js';
import { GrpcError } from './GrpcError.js';

export class InvalidArgumentGrpcError extends GrpcError {
  constructor(
    details: string = 'Invalid Argument',
    errorOptions?: ErrorOptions,
    metadata?: GrpcMetadata,
  ) {
    super(GrpcStatusCode.INVALID_ARGUMENT, details, errorOptions, metadata);
  }
}
