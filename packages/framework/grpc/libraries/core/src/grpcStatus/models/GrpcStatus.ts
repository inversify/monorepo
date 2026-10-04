import { type GrpcMetadata } from './GrpcMetadata.js';
import { type GrpcStatusCode } from './GrpcStatusCode.js';

export interface GrpcStatus {
  code: GrpcStatusCode;
  details: string;
  metadata?: GrpcMetadata | undefined;
}
