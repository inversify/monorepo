export interface NativeMiddleware {
  readonly id: string;
  readonly endedAt: Date;
  readonly error: unknown;
  readonly name: string;
  readonly startedAt: Date;
}
