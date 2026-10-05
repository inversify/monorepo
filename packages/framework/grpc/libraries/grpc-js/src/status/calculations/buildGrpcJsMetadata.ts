import { Metadata } from '@grpc/grpc-js';
import { type GrpcMetadata } from '@inversifyjs/grpc-core';

export interface GrpcJsMetadataBuild {
  errors: unknown[];
  metadata: Metadata;
}

export function buildGrpcJsMetadata(
  metadata: GrpcMetadata,
): GrpcJsMetadataBuild {
  const errors: unknown[] = [];
  const grpcMetadata: Metadata = new Metadata();

  for (const [key, value] of Object.entries(metadata)) {
    try {
      grpcMetadata.set(key, value);
    } catch (error: unknown) {
      errors.push(error);
    }
  }

  return {
    errors,
    metadata: grpcMetadata,
  };
}
