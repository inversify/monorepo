import { beforeAll, describe, expect, it } from 'vitest';

import { Buffer } from 'node:buffer';

import { Metadata } from '@grpc/grpc-js';
import { type GrpcMetadata } from '@inversifyjs/grpc-core';

import {
  buildGrpcJsMetadata,
  type GrpcJsMetadataBuild,
} from './buildGrpcJsMetadata.js';

describe(buildGrpcJsMetadata, () => {
  describe('having string metadata', () => {
    describe('when called', () => {
      let metadataFixture: GrpcMetadata;
      let resultFixture: GrpcJsMetadataBuild;

      beforeAll(() => {
        metadataFixture = {
          'X-Hero-Id': 'hero-1',
        };
        resultFixture = buildGrpcJsMetadata(metadataFixture);
      });

      it('should return grpc-js metadata', () => {
        expect(resultFixture.metadata).toBeInstanceOf(Metadata);
      });

      it('should keep the value under the normalized key', () => {
        expect(resultFixture.metadata.get('x-hero-id')).toStrictEqual([
          'hero-1',
        ]);
      });

      it('should report no rejections', () => {
        expect(resultFixture.errors).toStrictEqual([]);
      });
    });
  });

  describe('having binary metadata', () => {
    describe('when called', () => {
      let bytesFixture: Buffer;
      let resultFixture: GrpcJsMetadataBuild;

      beforeAll(() => {
        bytesFixture = Buffer.from('hero');
        resultFixture = buildGrpcJsMetadata({
          'raw-bin': bytesFixture,
        });
      });

      it('should keep the buffer value', () => {
        expect(resultFixture.metadata.get('raw-bin')).toStrictEqual([
          bytesFixture,
        ]);
      });
    });
  });

  describe('having an empty metadata record', () => {
    describe('when called', () => {
      let resultFixture: GrpcJsMetadataBuild;

      beforeAll(() => {
        resultFixture = buildGrpcJsMetadata({});
      });

      it('should return metadata with no values', () => {
        expect(resultFixture.metadata.get('x-hero-id')).toStrictEqual([]);
      });
    });
  });

  describe('having a buffer for a key that does not end with -bin', () => {
    describe('when called', () => {
      let resultFixture: GrpcJsMetadataBuild;

      beforeAll(() => {
        resultFixture = buildGrpcJsMetadata({
          raw: Buffer.from('hero'),
        });
      });

      it('should omit that key', () => {
        expect(resultFixture.metadata.get('raw')).toStrictEqual([]);
      });

      it('should report the rejection', () => {
        expect(resultFixture.errors).toHaveLength(1);
        expect(resultFixture.errors[0]).toBeInstanceOf(Error);
      });
    });
  });

  describe('having a valid entry and a buffer for a key that does not end with -bin', () => {
    describe('when called', () => {
      let resultFixture: GrpcJsMetadataBuild;

      beforeAll(() => {
        resultFixture = buildGrpcJsMetadata({
          raw: Buffer.from('hero'),
          'x-hero-id': 'hero-1',
        });
      });

      it('should keep the valid entry', () => {
        expect(resultFixture.metadata.get('x-hero-id')).toStrictEqual([
          'hero-1',
        ]);
      });

      it('should omit the rejected key', () => {
        expect(resultFixture.metadata.get('raw')).toStrictEqual([]);
      });

      it('should report only the rejected key', () => {
        expect(resultFixture.errors).toHaveLength(1);
      });
    });
  });
});
