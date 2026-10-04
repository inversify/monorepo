import { beforeAll, describe, expect, it } from 'vitest';

import { type GrpcMetadata } from '../../grpcStatus/models/GrpcMetadata.js';
import { GrpcStatusCode } from '../../grpcStatus/models/GrpcStatusCode.js';
import { GrpcError } from './GrpcError.js';

describe(GrpcError, () => {
  describe('.constructor', () => {
    describe('having code, details, error options and metadata', () => {
      let causeFixture: Error;
      let codeFixture: GrpcStatusCode.NOT_FOUND;
      let detailsFixture: string;
      let metadataFixture: GrpcMetadata;

      beforeAll(() => {
        causeFixture = new Error('cause');
        codeFixture = GrpcStatusCode.NOT_FOUND;
        detailsFixture = 'Hero not found';
        metadataFixture = {
          'x-hero-id': 'hero-1',
        };
      });

      describe('when called', () => {
        let result: GrpcError;

        beforeAll(() => {
          result = new GrpcError(
            codeFixture,
            detailsFixture,
            { cause: causeFixture },
            metadataFixture,
          );
        });

        it('should be an Error', () => {
          expect(result).toBeInstanceOf(Error);
        });

        it('should set the code', () => {
          expect(result.code).toBe(codeFixture);
        });

        it('should set the details as details and message', () => {
          expect(result.details).toBe(detailsFixture);
          expect(result.message).toBe(detailsFixture);
        });

        it('should set the cause', () => {
          expect(result.cause).toBe(causeFixture);
        });

        it('should set the metadata', () => {
          expect(result.metadata).toBe(metadataFixture);
        });
      });
    });
  });
});
