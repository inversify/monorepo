import { beforeAll, describe, expect, it } from 'vitest';

import { MiddlewarePhase } from '@inversifyjs/http-core';

import { type Middleware as PrismaMiddleware } from '../../../../generated/prisma/client.js';
import { ErrorTraceFixtures } from '../../../domain/fixtures/ErrorTraceFixtures.js';
import { type Middleware } from '../../../domain/models/Middleware.js';
import { PrismaMiddlewareFixtures } from '../fixtures/PrismaMiddlewareFixtures.js';
import { ErrorTracesFromPrismaJsonBuilder } from './ErrorTracesFromPrismaJsonBuilder.js';
import { MiddlewareFromPrismaMiddlewareBuilder } from './MiddlewareFromPrismaMiddlewareBuilder.js';

describe(MiddlewareFromPrismaMiddlewareBuilder, () => {
  let middlewareFromPrismaMiddlewareBuilder: MiddlewareFromPrismaMiddlewareBuilder;

  beforeAll(() => {
    middlewareFromPrismaMiddlewareBuilder =
      new MiddlewareFromPrismaMiddlewareBuilder(
        new ErrorTracesFromPrismaJsonBuilder(),
      );
  });

  describe('.build', () => {
    describe('having a prisma middleware', () => {
      let prismaMiddlewareFixture: PrismaMiddleware;

      beforeAll(() => {
        prismaMiddlewareFixture = PrismaMiddlewareFixtures.any;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = middlewareFromPrismaMiddlewareBuilder.build(
            prismaMiddlewareFixture,
          );
        });

        it('should return a Middleware', () => {
          const expected: Middleware = {
            endedAt: prismaMiddlewareFixture.ended_at,
            error: prismaMiddlewareFixture.error,
            errorTraces: [ErrorTraceFixtures.any],
            id: prismaMiddlewareFixture.id,
            middleware: prismaMiddlewareFixture.middleware,
            phase: MiddlewarePhase.PreHandler,
            startedAt: prismaMiddlewareFixture.started_at,
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a prisma middleware with an unknown phase', () => {
      let prismaMiddlewareFixture: PrismaMiddleware;

      beforeAll(() => {
        prismaMiddlewareFixture = {
          ...PrismaMiddlewareFixtures.any,
          phase: 'nope',
        };
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            middlewareFromPrismaMiddlewareBuilder.build(
              prismaMiddlewareFixture,
            );
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an Error', () => {
          expect(result).toStrictEqual(
            new Error(
              `Unknown middleware phase "${prismaMiddlewareFixture.phase}".`,
            ),
          );
        });
      });
    });
  });
});
