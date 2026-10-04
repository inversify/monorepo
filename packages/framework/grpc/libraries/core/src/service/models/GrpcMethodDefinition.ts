import { type Buffer } from 'node:buffer';

// Method signatures keep parameters bivariant, so generated definitions with
// typed serializers stay assignable to this interface.
export interface GrpcMethodDefinition<TRequest = unknown, TResponse = unknown> {
  path: string;
  requestStream: boolean;
  responseStream: boolean;
  requestDeserialize(bytes: Buffer): TRequest;
  requestSerialize(value: TRequest): Buffer;
  responseDeserialize(bytes: Buffer): TResponse;
  responseSerialize(value: TResponse): Buffer;
}
