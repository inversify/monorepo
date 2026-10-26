import { type Guard } from '../models/Guard.js';
import { ErrorTraceFixtures } from './ErrorTraceFixtures.js';

export class GuardFixtures {
  public static get any(): Guard {
    return {
      allowed: true,
      endedAt: new Date('2026-01-01T00:00:02.000Z'),
      error: null,
      errorTraces: [ErrorTraceFixtures.any],
      guard: 'FooGuard',
      id: 'guard-id',
      startedAt: new Date('2026-01-01T00:00:01.000Z'),
    };
  }
}
