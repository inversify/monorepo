import { type PrismaGuardWithPlan } from '../builders/prismaPlanInclude.js';
import { errorTracesJson } from './errorTracesJson.js';

export class PrismaGuardFixtures {
  public static get any(): PrismaGuardWithPlan {
    return {
      allowed: true,
      call_id: 'call-id',
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      ended_at: new Date('2026-01-01T00:00:02.000Z'),
      error: null,
      error_traces: errorTracesJson,
      guard: 'FooGuard',
      id: 'guard-id',
      plan: null,
      started_at: new Date('2026-01-01T00:00:01.000Z'),
      updated_at: new Date('2026-01-01T00:00:00.000Z'),
    };
  }
}
