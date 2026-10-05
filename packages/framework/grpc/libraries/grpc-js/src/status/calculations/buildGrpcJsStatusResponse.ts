import { type StatusObject } from '@grpc/grpc-js';
import { type GrpcStatus } from '@inversifyjs/grpc-core';

import { type GrpcJsStatusResponse } from '../models/GrpcJsStatusResponse.js';
import {
  buildGrpcJsMetadata,
  type GrpcJsMetadataBuild,
} from './buildGrpcJsMetadata.js';

export interface GrpcJsStatusBuild {
  errors: unknown[];
  statusResponse: GrpcJsStatusResponse;
}

export function buildGrpcJsStatusResponse(
  grpcStatus: GrpcStatus,
): GrpcJsStatusBuild {
  const statusResponse: GrpcJsStatusResponse = {
    code: grpcStatus.code as unknown as StatusObject['code'],
    details: grpcStatus.details,
  };
  let errors: unknown[] = [];

  if (grpcStatus.metadata !== undefined) {
    const metadataBuild: GrpcJsMetadataBuild = buildGrpcJsMetadata(
      grpcStatus.metadata,
    );

    errors = metadataBuild.errors;

    if (
      metadataBuild.errors.length === 0 ||
      Object.keys(metadataBuild.metadata.getMap()).length > 0
    ) {
      statusResponse.metadata = metadataBuild.metadata;
    }
  }

  return {
    errors,
    statusResponse,
  };
}
