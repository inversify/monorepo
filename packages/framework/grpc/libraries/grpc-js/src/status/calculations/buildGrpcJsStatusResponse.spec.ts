import { beforeAll, describe, expect, it } from 'vitest';

import { status } from '@grpc/grpc-js';
import { type GrpcStatus, GrpcStatusCode } from '@inversifyjs/grpc-core';

import {
  buildGrpcJsStatusResponse,
  type GrpcJsStatusBuild,
} from './buildGrpcJsStatusResponse.js';

describe(buildGrpcJsStatusResponse, () => {
  describe('having a status without metadata', () => {
    describe('when called', () => {
      let resultFixture: GrpcJsStatusBuild;

      beforeAll(() => {
        resultFixture = buildGrpcJsStatusResponse({
          code: GrpcStatusCode.NOT_FOUND,
          details: 'missing',
        });
      });

      it('should copy the grpc-js status code and details', () => {
        expect(resultFixture.statusResponse).toStrictEqual({
          code: status.NOT_FOUND,
          details: 'missing',
        });
      });

      it('should report no metadata failures', () => {
        expect(resultFixture.errors).toStrictEqual([]);
      });
    });
  });

  describe('having a status with metadata', () => {
    describe('when called', () => {
      let resultFixture: GrpcJsStatusBuild;
      let statusFixture: GrpcStatus;

      beforeAll(() => {
        statusFixture = {
          code: GrpcStatusCode.NOT_FOUND,
          details: 'missing',
          metadata: {
            'x-hero-id': 'hero-1',
          },
        };
        resultFixture = buildGrpcJsStatusResponse(statusFixture);
      });

      it('should copy the status code', () => {
        expect(resultFixture.statusResponse.code).toBe(status.NOT_FOUND);
      });

      it('should copy the details', () => {
        expect(resultFixture.statusResponse.details).toBe('missing');
      });

      it('should copy the metadata value', () => {
        expect(
          resultFixture.statusResponse.metadata?.get('x-hero-id'),
        ).toStrictEqual(['hero-1']);
      });
    });
  });
});
