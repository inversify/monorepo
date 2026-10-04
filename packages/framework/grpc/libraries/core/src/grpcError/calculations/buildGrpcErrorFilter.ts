import { type ErrorFilter } from '@inversifyjs/framework-core';

import { type GrpcStatus } from '../../grpcStatus/models/GrpcStatus.js';
import { type GrpcError } from '../models/GrpcError.js';

export function buildGrpcErrorFilter<TRequest, TResponse, TResult>(
  sendStatus: (
    request: TRequest,
    response: TResponse,
    status: GrpcStatus,
  ) => Promise<TResult> | TResult,
): ErrorFilter<GrpcError, TRequest, TResponse, TResult> {
  return {
    catch(
      error: GrpcError,
      request: TRequest,
      response: TResponse,
    ): Promise<TResult> | TResult {
      return sendStatus(request, response, error);
    },
  };
}
