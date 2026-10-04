import { type GrpcMetadata } from '../../grpcStatus/models/GrpcMetadata.js';
import { GrpcStatusCode } from '../../grpcStatus/models/GrpcStatusCode.js';
import { GrpcError } from './GrpcError.js';

export class UnimplementedGrpcError extends GrpcError {
  constructor(
    details: string = 'Unimplemented',
    errorOptions?: ErrorOptions,
    metadata?: GrpcMetadata,
  ) {
    super(GrpcStatusCode.UNIMPLEMENTED, details, errorOptions, metadata);
  }
}
