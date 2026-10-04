import { type GrpcMetadata } from '../../grpcStatus/models/GrpcMetadata.js';
import { type GrpcStatus } from '../../grpcStatus/models/GrpcStatus.js';
import { type GrpcStatusCode } from '../../grpcStatus/models/GrpcStatusCode.js';

export class GrpcError extends Error implements GrpcStatus {
  constructor(
    public readonly code: Exclude<GrpcStatusCode, GrpcStatusCode.OK>,
    public readonly details: string,
    errorOptions?: ErrorOptions,
    public readonly metadata?: GrpcMetadata | undefined,
  ) {
    super(details, errorOptions);
  }
}
