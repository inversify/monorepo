import { type GrpcMetadata } from '../../grpcStatus/models/GrpcMetadata.js';
import { GrpcStatusCode } from '../../grpcStatus/models/GrpcStatusCode.js';
import { GrpcError } from './GrpcError.js';

export class AlreadyExistsGrpcError extends GrpcError {
  constructor(
    details: string = 'Already Exists',
    errorOptions?: ErrorOptions,
    metadata?: GrpcMetadata,
  ) {
    super(GrpcStatusCode.ALREADY_EXISTS, details, errorOptions, metadata);
  }
}
