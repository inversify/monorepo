import { type GrpcMetadata } from '../../grpcStatus/models/GrpcMetadata.js';
import { GrpcStatusCode } from '../../grpcStatus/models/GrpcStatusCode.js';
import { GrpcError } from './GrpcError.js';

export class CancelledGrpcError extends GrpcError {
  constructor(
    details: string = 'Cancelled',
    errorOptions?: ErrorOptions,
    metadata?: GrpcMetadata,
  ) {
    super(GrpcStatusCode.CANCELLED, details, errorOptions, metadata);
  }
}
