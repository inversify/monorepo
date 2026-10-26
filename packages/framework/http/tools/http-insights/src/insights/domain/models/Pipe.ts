import { type ErrorTrace } from './ErrorTrace.js';

export interface Pipe {
  readonly id: string;
  readonly endedAt: Date;
  readonly error: unknown;
  readonly errorTraces: readonly ErrorTrace[] | null;
  readonly method: string;
  readonly parameterIndex: number;
  readonly pipe: string;
  readonly startedAt: Date;
}
