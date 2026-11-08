import { type PrismaInterceptorWithPlan } from '../builders/prismaPlanInclude.js';
import { errorTracesJson } from './errorTracesJson.js';

export class PrismaInterceptorFixtures {
  public static get any(): PrismaInterceptorWithPlan {
    return {
      call_id: 'call-id',
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      ended_at: new Date('2026-01-01T00:00:02.000Z'),
      error: null,
      error_traces: errorTracesJson,
      id: 'interceptor-id',
      interceptor: 'FooInterceptor',
      plan: null,
      started_at: new Date('2026-01-01T00:00:01.000Z'),
      updated_at: new Date('2026-01-01T00:00:00.000Z'),
    };
  }
}
