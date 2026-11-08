import { type ErrorTrace } from './ErrorTrace.js';
import { type Plan } from './Plan.js';

export interface Interceptor {
  readonly id: string;
  readonly endedAt: Date;
  readonly error: unknown;
  readonly errorTraces: readonly ErrorTrace[] | null;
  readonly interceptor: string;
  readonly plan: Plan | null;
  readonly startedAt: Date;
}
