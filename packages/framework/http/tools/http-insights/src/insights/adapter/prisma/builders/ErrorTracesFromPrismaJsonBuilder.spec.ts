import { beforeAll, describe, expect, it } from 'vitest';

import { type Prisma } from '../../../../generated/prisma/client.js';
import { ErrorTraceFixtures } from '../../../domain/fixtures/ErrorTraceFixtures.js';
import { type ErrorTrace } from '../../../domain/models/ErrorTrace.js';
import { ErrorTracesFromPrismaJsonBuilder } from './ErrorTracesFromPrismaJsonBuilder.js';

describe(ErrorTracesFromPrismaJsonBuilder, () => {
  let errorTracesFromPrismaJsonBuilder: ErrorTracesFromPrismaJsonBuilder;

  beforeAll(() => {
    errorTracesFromPrismaJsonBuilder = new ErrorTracesFromPrismaJsonBuilder();
  });

  describe('.build', () => {
    describe('having stored traces', () => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = errorTracesFromPrismaJsonBuilder.build([
            ErrorTraceFixtures.any,
          ] as unknown as Prisma.JsonValue);
        });

        it('should return the traces', () => {
          const expected: readonly ErrorTrace[] = [ErrorTraceFixtures.any];

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a trace without a function name', () => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = errorTracesFromPrismaJsonBuilder.build([
            {
              ...ErrorTraceFixtures.any,
              location: {
                ...ErrorTraceFixtures.any.location,
                functionName: null,
              },
            },
          ] as unknown as Prisma.JsonValue);
        });

        it('should keep the null function name', () => {
          expect(result).toStrictEqual([
            {
              ...ErrorTraceFixtures.any,
              location: {
                ...ErrorTraceFixtures.any.location,
                functionName: null,
              },
            },
          ]);
        });
      });
    });

    describe('having null', () => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = errorTracesFromPrismaJsonBuilder.build(null);
        });

        it('should return null', () => {
          expect(result).toBeNull();
        });
      });
    });

    describe('having an empty array', () => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = errorTracesFromPrismaJsonBuilder.build([]);
        });

        it('should return null', () => {
          expect(result).toBeNull();
        });
      });
    });

    describe('having a trace with a missing statement', () => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = errorTracesFromPrismaJsonBuilder.build([
            {
              location: ErrorTraceFixtures.any.location,
              nextStatements: [],
              previousStatements: [],
            },
          ] as unknown as Prisma.JsonValue);
        });

        it('should return null', () => {
          expect(result).toBeNull();
        });
      });
    });
  });
});
