import { type GrpcMetadata } from '../../grpcStatus/models/GrpcMetadata.js';
import { GrpcStatusCode } from '../../grpcStatus/models/GrpcStatusCode.js';
import { GrpcError } from './GrpcError.js';

export class DeadlineExceededGrpcError extends GrpcError {
  constructor(
    details: string = 'Deadline Exceeded',
    errorOptions?: ErrorOptions,
    metadata?: GrpcMetadata,
  ) {
    super(GrpcStatusCode.DEADLINE_EXCEEDED, details, errorOptions, metadata);
  }
}
