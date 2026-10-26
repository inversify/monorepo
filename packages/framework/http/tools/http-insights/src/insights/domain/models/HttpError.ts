import { type ErrorTrace } from './ErrorTrace.js';

export interface HttpError {
  readonly id: string;
  readonly endedAt: Date;
  readonly error: unknown;
  readonly errorTraces: readonly ErrorTrace[] | null;
  readonly filter: string | null;
  readonly startedAt: Date;
}
