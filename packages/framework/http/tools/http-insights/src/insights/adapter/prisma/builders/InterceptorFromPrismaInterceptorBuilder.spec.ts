import { beforeAll, describe, expect, it } from 'vitest';

import { type Interceptor as PrismaInterceptor } from '../../../../generated/prisma/client.js';
import { type Interceptor } from '../../../domain/models/Interceptor.js';
import { PrismaInterceptorFixtures } from '../fixtures/PrismaInterceptorFixtures.js';
import { InterceptorFromPrismaInterceptorBuilder } from './InterceptorFromPrismaInterceptorBuilder.js';

describe(InterceptorFromPrismaInterceptorBuilder, () => {
  let interceptorFromPrismaInterceptorBuilder: InterceptorFromPrismaInterceptorBuilder;

  beforeAll(() => {
    interceptorFromPrismaInterceptorBuilder =
      new InterceptorFromPrismaInterceptorBuilder();
  });

  describe('.build', () => {
    describe('when called', () => {
      let prismaInterceptorFixture: PrismaInterceptor;

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
          id: prismaInterceptorFixture.id,
          interceptor: prismaInterceptorFixture.interceptor,
          startedAt: prismaInterceptorFixture.started_at,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
