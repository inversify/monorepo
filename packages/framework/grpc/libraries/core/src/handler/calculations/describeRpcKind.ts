import { type GrpcMethodDefinition } from '../../service/models/GrpcMethodDefinition.js';

export function describeRpcKind(
  methodDefinition: GrpcMethodDefinition,
): string {
  if (methodDefinition.requestStream) {
    if (methodDefinition.responseStream) {
      return 'bidi';
    }

    return 'clientStream';
  }

  if (methodDefinition.responseStream) {
    return 'serverStream';
  }

  return 'unary';
}
