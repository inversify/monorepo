import { type ServerOptions } from '@grpc/grpc-js';
import { type InversifyGrpcAdapterOptions } from '@inversifyjs/grpc-core';

export interface InversifyGrpcJsAdapterOptions extends InversifyGrpcAdapterOptions {
  serverOptions?: ServerOptions;
}
