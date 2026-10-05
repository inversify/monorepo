import { type GrpcJsStatusResponse } from '../status/models/GrpcJsStatusResponse.js';

export interface GrpcJsCall {
  emit(event: 'error', status: GrpcJsStatusResponse): boolean;
}
