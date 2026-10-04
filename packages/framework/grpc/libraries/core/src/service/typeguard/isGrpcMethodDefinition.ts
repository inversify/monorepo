import { type GrpcMethodDefinition } from '../models/GrpcMethodDefinition.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isGrpcMethodDefinition(
  value: unknown,
): value is GrpcMethodDefinition {
  return (
    isRecord(value) &&
    typeof value['path'] === 'string' &&
    typeof value['requestStream'] === 'boolean' &&
    typeof value['responseStream'] === 'boolean' &&
    typeof value['requestSerialize'] === 'function' &&
    typeof value['requestDeserialize'] === 'function' &&
    typeof value['responseSerialize'] === 'function' &&
    typeof value['responseDeserialize'] === 'function'
  );
}
