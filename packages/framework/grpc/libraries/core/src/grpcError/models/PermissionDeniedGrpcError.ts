import { type GrpcMetadata } from '../../grpcStatus/models/GrpcMetadata.js';
import { GrpcStatusCode } from '../../grpcStatus/models/GrpcStatusCode.js';
import { GrpcError } from './GrpcError.js';

export class PermissionDeniedGrpcError extends GrpcError {
  constructor(
    details: string = 'Permission Denied',
    errorOptions?: ErrorOptions,
    metadata?: GrpcMetadata,
  ) {
    super(GrpcStatusCode.PERMISSION_DENIED, details, errorOptions, metadata);
  }
}
