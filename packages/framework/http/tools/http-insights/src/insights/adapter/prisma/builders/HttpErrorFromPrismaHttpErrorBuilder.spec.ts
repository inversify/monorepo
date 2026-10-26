import { beforeAll, describe, expect, it } from 'vitest';

import { type HttpError as PrismaHttpError } from '../../../../generated/prisma/client.js';
import { ErrorTraceFixtures } from '../../../domain/fixtures/ErrorTraceFixtures.js';
import { type HttpError } from '../../../domain/models/HttpError.js';
import { PrismaHttpErrorFixtures } from '../fixtures/PrismaHttpErrorFixtures.js';
import { ErrorTracesFromPrismaJsonBuilder } from './ErrorTracesFromPrismaJsonBuilder.js';
import { HttpErrorFromPrismaHttpErrorBuilder } from './HttpErrorFromPrismaHttpErrorBuilder.js';

describe(HttpErrorFromPrismaHttpErrorBuilder, () => {
  let httpErrorFromPrismaHttpErrorBuilder: HttpErrorFromPrismaHttpErrorBuilder;

  beforeAll(() => {
    httpErrorFromPrismaHttpErrorBuilder =
      new HttpErrorFromPrismaHttpErrorBuilder(
        new ErrorTracesFromPrismaJsonBuilder(),
      );
  });

  describe('.build', () => {
    describe('when called', () => {
      let prismaHttpErrorFixture: PrismaHttpError;

      let result: unknown;

      beforeAll(() => {
        prismaHttpErrorFixture = PrismaHttpErrorFixtures.any;

        result = httpErrorFromPrismaHttpErrorBuilder.build(
          prismaHttpErrorFixture,
        );
      });

      it('should return an HttpError', () => {
        const expected: HttpError = {
          endedAt: prismaHttpErrorFixture.ended_at,
          error: prismaHttpErrorFixture.error,
          errorTraces: [ErrorTraceFixtures.any],
          filter: prismaHttpErrorFixture.filter,
          id: prismaHttpErrorFixture.id,
          startedAt: prismaHttpErrorFixture.started_at,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
