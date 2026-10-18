import { type MiddlewarePhase } from '@inversifyjs/http-core';

export interface Middleware {
  readonly id: string;
  readonly endedAt: Date;
  readonly error: unknown;
  readonly middleware: string;
  readonly phase: MiddlewarePhase;
  readonly startedAt: Date;
}
