import { beforeAll, describe, expect, it } from 'vitest';

import { type Guard as PrismaGuard } from '../../../../generated/prisma/client.js';
import { ErrorTraceFixtures } from '../../../domain/fixtures/ErrorTraceFixtures.js';
import { type Guard } from '../../../domain/models/Guard.js';
import { PrismaGuardFixtures } from '../fixtures/PrismaGuardFixtures.js';
import { ErrorTracesFromPrismaJsonBuilder } from './ErrorTracesFromPrismaJsonBuilder.js';
import { GuardFromPrismaGuardBuilder } from './GuardFromPrismaGuardBuilder.js';

describe(GuardFromPrismaGuardBuilder, () => {
  let guardFromPrismaGuardBuilder: GuardFromPrismaGuardBuilder;

  beforeAll(() => {
    guardFromPrismaGuardBuilder = new GuardFromPrismaGuardBuilder(
      new ErrorTracesFromPrismaJsonBuilder(),
    );
  });

  describe('.build', () => {
    describe('when called', () => {
      let prismaGuardFixture: PrismaGuard;

      let result: unknown;

      beforeAll(() => {
        prismaGuardFixture = PrismaGuardFixtures.any;

        result = guardFromPrismaGuardBuilder.build(prismaGuardFixture);
      });

      it('should return a Guard', () => {
        const expected: Guard = {
          allowed: prismaGuardFixture.allowed,
          endedAt: prismaGuardFixture.ended_at,
          error: prismaGuardFixture.error,
          errorTraces: [ErrorTraceFixtures.any],
          guard: prismaGuardFixture.guard,
          id: prismaGuardFixture.id,
          startedAt: prismaGuardFixture.started_at,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
