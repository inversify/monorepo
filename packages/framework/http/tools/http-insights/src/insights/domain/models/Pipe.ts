export interface Pipe {
  readonly id: string;
  readonly endedAt: Date;
  readonly error: unknown;
  readonly method: string;
  readonly parameterIndex: number;
  readonly pipe: string;
  readonly startedAt: Date;
}
