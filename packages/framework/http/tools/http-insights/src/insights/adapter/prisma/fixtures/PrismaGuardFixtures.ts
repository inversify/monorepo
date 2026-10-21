import { type Guard } from '../../../../generated/prisma/client.js';

export class PrismaGuardFixtures {
  public static get any(): Guard {
    return {
      allowed: true,
      call_id: 'call-id',
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      ended_at: new Date('2026-01-01T00:00:02.000Z'),
      error: null,
      guard: 'FooGuard',
      id: 'guard-id',
      started_at: new Date('2026-01-01T00:00:01.000Z'),
      updated_at: new Date('2026-01-01T00:00:00.000Z'),
    };
  }
}
