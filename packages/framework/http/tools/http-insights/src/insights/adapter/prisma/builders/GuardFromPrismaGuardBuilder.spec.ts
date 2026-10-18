import { beforeAll, describe, expect, it } from 'vitest';

import { type Guard as PrismaGuard } from '../../../../generated/prisma/client.js';
import { type Guard } from '../../../domain/models/Guard.js';
import { PrismaGuardFixtures } from '../fixtures/PrismaGuardFixtures.js';
import { GuardFromPrismaGuardBuilder } from './GuardFromPrismaGuardBuilder.js';

describe(GuardFromPrismaGuardBuilder, () => {
  let guardFromPrismaGuardBuilder: GuardFromPrismaGuardBuilder;

  beforeAll(() => {
    guardFromPrismaGuardBuilder = new GuardFromPrismaGuardBuilder();
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
          guard: prismaGuardFixture.guard,
          id: prismaGuardFixture.id,
          startedAt: prismaGuardFixture.started_at,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
