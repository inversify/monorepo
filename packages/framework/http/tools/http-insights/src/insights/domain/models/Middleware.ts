import { type MiddlewarePhase } from '@inversifyjs/http-core';

import { type ErrorTrace } from './ErrorTrace.js';

export interface Middleware {
  readonly id: string;
  readonly endedAt: Date;
  readonly error: unknown;
  readonly errorTraces: readonly ErrorTrace[] | null;
  readonly middleware: string;
  readonly phase: MiddlewarePhase;
  readonly startedAt: Date;
}
