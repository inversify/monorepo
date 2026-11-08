import { type ErrorTrace } from './ErrorTrace.js';
import { type Plan } from './Plan.js';

export interface Guard {
  readonly id: string;
  readonly allowed: boolean | null;
  readonly endedAt: Date;
  readonly error: unknown;
  readonly errorTraces: readonly ErrorTrace[] | null;
  readonly guard: string;
  readonly plan: Plan | null;
  readonly startedAt: Date;
}
