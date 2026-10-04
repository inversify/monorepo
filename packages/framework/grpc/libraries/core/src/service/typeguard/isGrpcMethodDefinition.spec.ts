import { beforeAll, describe, expect, it } from 'vitest';

import { Buffer } from 'node:buffer';

import { isGrpcMethodDefinition } from './isGrpcMethodDefinition.js';

function buildValidDefinition(): Record<string, unknown> {
  return {
    path: '/test.Hero/GetHero',
    requestDeserialize: (bytes: Buffer): Buffer => bytes,
    requestSerialize: (): Buffer => Buffer.alloc(0),
    requestStream: false,
    responseDeserialize: (bytes: Buffer): Buffer => bytes,
    responseSerialize: (): Buffer => Buffer.alloc(0),
    responseStream: false,
  };
}

describe(isGrpcMethodDefinition, () => {
  describe('having a method definition', () => {
    describe('when called', () => {
      let resultFixture: boolean;

      beforeAll(() => {
        resultFixture = isGrpcMethodDefinition(buildValidDefinition());
      });

      it('should return true', () => {
        expect(resultFixture).toBe(true);
      });
    });
  });

  describe('having a @grpc/proto-loader method definition with extra properties', () => {
    describe('when called', () => {
      let resultFixture: boolean;

      beforeAll(() => {
        resultFixture = isGrpcMethodDefinition({
          ...buildValidDefinition(),
          originalName: 'getHero',
          requestType: {},
          responseType: {},
        });
      });

      it('should return true', () => {
        expect(resultFixture).toBe(true);
      });
    });
  });

  describe('having null', () => {
    describe('when called', () => {
      let resultFixture: boolean;

      beforeAll(() => {
        resultFixture = isGrpcMethodDefinition(null);
      });

      it('should return false', () => {
        expect(resultFixture).toBe(false);
      });
    });
  });

  describe('having a definition without path', () => {
    describe('when called', () => {
      let resultFixture: boolean;

      beforeAll(() => {
        const definition: Record<string, unknown> = buildValidDefinition();

        delete definition['path'];

        resultFixture = isGrpcMethodDefinition(definition);
      });

      it('should return false', () => {
        expect(resultFixture).toBe(false);
      });
    });
  });

  describe('having a definition whose requestStream is not boolean', () => {
    describe('when called', () => {
      let resultFixture: boolean;

      beforeAll(() => {
        resultFixture = isGrpcMethodDefinition({
          ...buildValidDefinition(),
          requestStream: 'false',
        });
      });

      it('should return false', () => {
        expect(resultFixture).toBe(false);
      });
    });
  });

  describe('having a definition whose responseStream is not boolean', () => {
    describe('when called', () => {
      let resultFixture: boolean;

      beforeAll(() => {
        resultFixture = isGrpcMethodDefinition({
          ...buildValidDefinition(),
          responseStream: 1,
        });
      });

      it('should return false', () => {
        expect(resultFixture).toBe(false);
      });
    });
  });

  describe('having a definition whose requestSerialize is not a function', () => {
    describe('when called', () => {
      let resultFixture: boolean;

      beforeAll(() => {
        resultFixture = isGrpcMethodDefinition({
          ...buildValidDefinition(),
          requestSerialize: 'serialize',
        });
      });

      it('should return false', () => {
        expect(resultFixture).toBe(false);
      });
    });
  });

  describe('having a definition whose requestDeserialize is not a function', () => {
    describe('when called', () => {
      let resultFixture: boolean;

      beforeAll(() => {
        resultFixture = isGrpcMethodDefinition({
          ...buildValidDefinition(),
          requestDeserialize: 'deserialize',
        });
      });

      it('should return false', () => {
        expect(resultFixture).toBe(false);
      });
    });
  });

  describe('having a definition whose responseSerialize is not a function', () => {
    describe('when called', () => {
      let resultFixture: boolean;

      beforeAll(() => {
        resultFixture = isGrpcMethodDefinition({
          ...buildValidDefinition(),
          responseSerialize: 'serialize',
        });
      });

      it('should return false', () => {
        expect(resultFixture).toBe(false);
      });
    });
  });

  describe('having a definition whose responseDeserialize is not a function', () => {
    describe('when called', () => {
      let resultFixture: boolean;

      beforeAll(() => {
        resultFixture = isGrpcMethodDefinition({
          ...buildValidDefinition(),
          responseDeserialize: 'deserialize',
        });
      });

      it('should return false', () => {
        expect(resultFixture).toBe(false);
      });
    });
  });
});
