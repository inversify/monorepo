import { beforeAll, describe, expect, it } from 'vitest';

import { ErrorTraceFixtures } from '../../../domain/fixtures/ErrorTraceFixtures.js';
import { type Interceptor } from '../../../domain/models/Interceptor.js';
import { PrismaInterceptorFixtures } from '../fixtures/PrismaInterceptorFixtures.js';
import { ErrorTracesFromPrismaJsonBuilder } from './ErrorTracesFromPrismaJsonBuilder.js';
import { InterceptorFromPrismaInterceptorBuilder } from './InterceptorFromPrismaInterceptorBuilder.js';
import { PlanFromPrismaPlanBuilder } from './PlanFromPrismaPlanBuilder.js';
import { type PrismaInterceptorWithPlan } from './prismaPlanInclude.js';

describe(InterceptorFromPrismaInterceptorBuilder, () => {
  let interceptorFromPrismaInterceptorBuilder: InterceptorFromPrismaInterceptorBuilder;

  beforeAll(() => {
    interceptorFromPrismaInterceptorBuilder =
      new InterceptorFromPrismaInterceptorBuilder(
        new ErrorTracesFromPrismaJsonBuilder(),
        new PlanFromPrismaPlanBuilder(),
      );
  });

  describe('.build', () => {
    describe('when called', () => {
      let prismaInterceptorFixture: PrismaInterceptorWithPlan;

      let result: unknown;

      beforeAll(() => {
        prismaInterceptorFixture = PrismaInterceptorFixtures.any;

        result = interceptorFromPrismaInterceptorBuilder.build(
          prismaInterceptorFixture,
        );
      });

      it('should return an Interceptor', () => {
        const expected: Interceptor = {
          endedAt: prismaInterceptorFixture.ended_at,
          error: prismaInterceptorFixture.error,
          errorTraces: [ErrorTraceFixtures.any],
          id: prismaInterceptorFixture.id,
          interceptor: prismaInterceptorFixture.interceptor,
          plan: null,
          startedAt: prismaInterceptorFixture.started_at,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
