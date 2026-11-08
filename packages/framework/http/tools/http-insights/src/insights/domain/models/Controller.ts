import { type ErrorTrace } from './ErrorTrace.js';
import { type Plan } from './Plan.js';

export interface Controller {
  readonly id: string;
  readonly controller: string;
  readonly endedAt: Date;
  readonly error: unknown;
  readonly errorTraces: readonly ErrorTrace[] | null;
  readonly method: string;
  readonly plan: Plan | null;
  readonly startedAt: Date;
}
