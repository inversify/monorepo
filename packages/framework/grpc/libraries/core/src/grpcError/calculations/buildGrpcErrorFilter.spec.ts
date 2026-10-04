import { beforeAll, describe, expect, it, type Mock, vitest } from 'vitest';

import { type ErrorFilter } from '@inversifyjs/framework-core';

import { type GrpcStatus } from '../../grpcStatus/models/GrpcStatus.js';
import { type GrpcError } from '../models/GrpcError.js';
import { NotFoundGrpcError } from '../models/NotFoundGrpcError.js';
import { buildGrpcErrorFilter } from './buildGrpcErrorFilter.js';

describe(buildGrpcErrorFilter, () => {
  describe('having a sendStatus function', () => {
    let sendStatusMock: Mock<
      (request: string, response: string, status: GrpcStatus) => string
    >;

    beforeAll(() => {
      sendStatusMock = vitest.fn().mockReturnValue('sent');
    });

    describe('when called, and the error filter catches an error', () => {
      let errorFixture: GrpcError;
      let result: unknown;

      beforeAll(() => {
        errorFixture = new NotFoundGrpcError('Hero not found');

        const errorFilter: ErrorFilter<GrpcError, string, string, string> =
          buildGrpcErrorFilter(sendStatusMock);

        result = errorFilter.catch(errorFixture, 'request', 'response');
      });

      it('should call sendStatus() with the error as status', () => {
        expect(sendStatusMock).toHaveBeenCalledExactlyOnceWith(
          'request',
          'response',
          errorFixture,
        );
      });

      it('should return the sendStatus() result', () => {
        expect(result).toBe('sent');
      });
    });
  });
});
