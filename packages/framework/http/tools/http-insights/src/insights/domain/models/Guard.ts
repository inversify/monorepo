import { type ErrorTrace } from './ErrorTrace.js';

export interface Guard {
  readonly id: string;
  readonly allowed: boolean | null;
  readonly endedAt: Date;
  readonly error: unknown;
  readonly errorTraces: readonly ErrorTrace[] | null;
  readonly guard: string;
  readonly startedAt: Date;
}
