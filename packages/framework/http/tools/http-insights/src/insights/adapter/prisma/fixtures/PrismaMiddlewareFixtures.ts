import { MiddlewarePhase } from '@inversifyjs/http-core';

import { type PrismaMiddlewareWithPlan } from '../builders/prismaPlanInclude.js';
import { errorTracesJson } from './errorTracesJson.js';

export class PrismaMiddlewareFixtures {
  public static get any(): PrismaMiddlewareWithPlan {
    return {
      call_id: 'call-id',
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      ended_at: new Date('2026-01-01T00:00:02.000Z'),
      error: null,
      error_traces: errorTracesJson,
      id: 'middleware-id',
      middleware: 'FooMiddleware',
      phase: MiddlewarePhase.PreHandler,
      plan: null,
      started_at: new Date('2026-01-01T00:00:01.000Z'),
      updated_at: new Date('2026-01-01T00:00:00.000Z'),
    };
  }
}
