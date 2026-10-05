import { type Metadata, type StatusObject } from '@grpc/grpc-js';

export interface GrpcJsStatusResponse {
  code: StatusObject['code'];
  details: string;
  metadata?: Metadata;
}
