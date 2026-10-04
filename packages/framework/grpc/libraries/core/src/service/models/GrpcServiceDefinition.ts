import { type GrpcMethodDefinition } from './GrpcMethodDefinition.js';

export interface GrpcServiceDefinition {
  readonly [methodName: string]: GrpcMethodDefinition;
}
