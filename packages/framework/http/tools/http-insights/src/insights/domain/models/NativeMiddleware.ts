import { type ErrorTrace } from './ErrorTrace.js';

export interface NativeMiddleware {
  readonly id: string;
  readonly endedAt: Date;
  readonly error: unknown;
  readonly errorTraces: readonly ErrorTrace[] | null;
  readonly name: string;
  readonly startedAt: Date;
}
