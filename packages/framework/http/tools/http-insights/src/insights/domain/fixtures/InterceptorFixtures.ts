import { type Interceptor } from '../models/Interceptor.js';
import { ErrorTraceFixtures } from './ErrorTraceFixtures.js';

export class InterceptorFixtures {
  public static get any(): Interceptor {
    return {
      endedAt: new Date('2026-01-01T00:00:02.000Z'),
      error: null,
      errorTraces: [ErrorTraceFixtures.any],
      id: 'interceptor-id',
      interceptor: 'FooInterceptor',
      startedAt: new Date('2026-01-01T00:00:01.000Z'),
    };
  }
}
