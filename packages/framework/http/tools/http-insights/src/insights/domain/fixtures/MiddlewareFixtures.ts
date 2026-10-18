import { MiddlewarePhase } from '@inversifyjs/http-core';

import { type Middleware } from '../models/Middleware.js';

export class MiddlewareFixtures {
  public static get any(): Middleware {
    return {
      endedAt: new Date('2026-01-01T00:00:02.000Z'),
      error: null,
      id: 'middleware-id',
      middleware: 'FooMiddleware',
      phase: MiddlewarePhase.PreHandler,
      startedAt: new Date('2026-01-01T00:00:01.000Z'),
    };
  }
}
