import { describe, expectTypeOf, it } from 'vitest';

import { Buffer } from 'node:buffer';

import { type GrpcServiceDefinition } from './GrpcServiceDefinition.js';

interface HelloRequest {
  name: string;
}

interface HelloReply {
  message: string;
}

interface ProtoLoaderMethodDefinition {
  originalName?: string;
  path: string;
  requestDeserialize: (bytes: Buffer) => object;
  requestSerialize: (value: object) => Buffer;
  requestStream: boolean;
  responseDeserialize: (bytes: Buffer) => object;
  responseSerialize: (value: object) => Buffer;
  responseStream: boolean;
}

interface ProtoLoaderServiceDefinition {
  [index: string]: ProtoLoaderMethodDefinition;
}

// eslint-disable-next-line vitest/prefer-describe-function-title
describe('GrpcServiceDefinition', () => {
  describe('having a generated definition with typed serializers', () => {
    describe('when used as GrpcServiceDefinition', () => {
      it('should be assignable', () => {
        expectTypeOf({
          sayHello: {
            path: '/helloworld.Greeter/SayHello',
            requestDeserialize: (bytes: Buffer): HelloRequest => ({
              name: bytes.toString(),
            }),
            requestSerialize: (value: HelloRequest): Buffer =>
              Buffer.from(value.name),
            requestStream: false,
            responseDeserialize: (bytes: Buffer): HelloReply => ({
              message: bytes.toString(),
            }),
            responseSerialize: (value: HelloReply): Buffer =>
              Buffer.from(value.message),
            responseStream: false,
          },
        } as const).toExtend<GrpcServiceDefinition>();
      });
    });
  });

  describe('having a @grpc/proto-loader definition', () => {
    describe('when used as GrpcServiceDefinition', () => {
      it('should be assignable', () => {
        expectTypeOf<ProtoLoaderServiceDefinition>().toExtend<GrpcServiceDefinition>();
      });
    });
  });

  describe('having a method definition without serializers', () => {
    describe('when used as GrpcServiceDefinition', () => {
      it('should not be assignable', () => {
        expectTypeOf<{
          getHero: { path: string };
        }>().not.toExtend<GrpcServiceDefinition>();
      });
    });
  });
});
