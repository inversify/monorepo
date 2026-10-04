import { type GrpcMetadata } from '../../grpcStatus/models/GrpcMetadata.js';
import { GrpcStatusCode } from '../../grpcStatus/models/GrpcStatusCode.js';
import { GrpcError } from './GrpcError.js';

export class OutOfRangeGrpcError extends GrpcError {
  constructor(
    details: string = 'Out Of Range',
    errorOptions?: ErrorOptions,
    metadata?: GrpcMetadata,
  ) {
    super(GrpcStatusCode.OUT_OF_RANGE, details, errorOptions, metadata);
  }
}
