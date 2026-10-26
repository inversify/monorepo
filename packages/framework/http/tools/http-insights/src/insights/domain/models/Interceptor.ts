import { type ErrorTrace } from './ErrorTrace.js';

export interface Interceptor {
  readonly id: string;
  readonly endedAt: Date;
  readonly error: unknown;
  readonly errorTraces: readonly ErrorTrace[] | null;
  readonly interceptor: string;
  readonly startedAt: Date;
}
