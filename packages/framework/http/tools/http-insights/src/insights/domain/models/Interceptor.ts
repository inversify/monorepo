export interface Interceptor {
  readonly id: string;
  readonly endedAt: Date;
  readonly error: unknown;
  readonly interceptor: string;
  readonly startedAt: Date;
}
