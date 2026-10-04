import { type GrpcMetadata } from '../../grpcStatus/models/GrpcMetadata.js';
import { GrpcStatusCode } from '../../grpcStatus/models/GrpcStatusCode.js';
import { GrpcError } from './GrpcError.js';

export class AbortedGrpcError extends GrpcError {
  constructor(
    details: string = 'Aborted',
    errorOptions?: ErrorOptions,
    metadata?: GrpcMetadata,
  ) {
    super(GrpcStatusCode.ABORTED, details, errorOptions, metadata);
  }
}
