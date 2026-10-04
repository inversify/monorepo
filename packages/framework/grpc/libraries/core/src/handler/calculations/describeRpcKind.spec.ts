import { beforeAll, describe, expect, it } from 'vitest';

import { Buffer } from 'node:buffer';

import { type GrpcMethodDefinition } from '../../service/models/GrpcMethodDefinition.js';
import { describeRpcKind } from './describeRpcKind.js';

function buildMethodDefinition(
  requestStream: boolean,
  responseStream: boolean,
): GrpcMethodDefinition {
  return {
    path: '/test.Hero/GetHero',
    requestDeserialize: (bytes: Buffer): Buffer => bytes,
    requestSerialize: (): Buffer => Buffer.alloc(0),
    requestStream,
    responseDeserialize: (bytes: Buffer): Buffer => bytes,
    responseSerialize: (): Buffer => Buffer.alloc(0),
    responseStream,
  };
}

describe(describeRpcKind, () => {
  describe('having a unary method', () => {
    describe('when called', () => {
      let resultFixture: string;

      beforeAll(() => {
        resultFixture = describeRpcKind(buildMethodDefinition(false, false));
      });

      it('should return unary', () => {
        expect(resultFixture).toBe('unary');
      });
    });
  });

  describe('having a client-streaming method', () => {
    describe('when called', () => {
      let resultFixture: string;

      beforeAll(() => {
        resultFixture = describeRpcKind(buildMethodDefinition(true, false));
      });

      it('should return clientStream', () => {
        expect(resultFixture).toBe('clientStream');
      });
    });
  });

  describe('having a server-streaming method', () => {
    describe('when called', () => {
      let resultFixture: string;

      beforeAll(() => {
        resultFixture = describeRpcKind(buildMethodDefinition(false, true));
      });

      it('should return serverStream', () => {
        expect(resultFixture).toBe('serverStream');
      });
    });
  });

  describe('having a bidirectional method', () => {
    describe('when called', () => {
      let resultFixture: string;

      beforeAll(() => {
        resultFixture = describeRpcKind(buildMethodDefinition(true, true));
      });

      it('should return bidi', () => {
        expect(resultFixture).toBe('bidi');
      });
    });
  });
});
