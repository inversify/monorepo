import { Buffer } from 'node:buffer';

import { GrpcServiceDefinition, RPC, Service } from '@inversifyjs/grpc-core';

import { HeroRequest } from './HeroRequest.js';
import { HeroResponse } from './HeroResponse.js';

function deserializeMessage(bytes: Buffer): unknown {
  return JSON.parse(bytes.toString()) as unknown;
}

function serializeMessage(value: unknown): Buffer {
  return Buffer.from(JSON.stringify(value));
}

export const heroServiceDefinition: GrpcServiceDefinition = {
  GetHero: {
    path: '/test.HeroService/GetHero',
    requestDeserialize: deserializeMessage,
    requestSerialize: serializeMessage,
    requestStream: false,
    responseDeserialize: deserializeMessage,
    responseSerialize: serializeMessage,
    responseStream: false,
  },
};

@Service(heroServiceDefinition)
export class HeroService {
  @RPC('GetHero')
  public getHero(call: { request: HeroRequest }): HeroResponse {
    return {
      name: call.request.id,
    };
  }
}
